<?php

namespace App\Models;


use \Shared\Model;
use App\Service\Sms;
use Illuminate\Support\Facades\Redis;

class User extends Model
{
    const ADMIN_SESSION_DURATION = 40;

    protected $connection = 'egecrm';
    protected $table = 'admins';
    protected $commaSeparated = ['rights'];

    const USER_TYPE    = 'ADMIN';
    const DEFAULT_COLOR = 'black';


    /**
     * Если пользователь заблокирован,то его цвет должен быть черным
     */
    public function getColorAttribute()
    {
        if ($this->allowed(\Shared\Rights::WSTAT_BANNED)) {
            return static::DEFAULT_COLOR;
        } else {
            return $this->attributes['color'];
        }
    }

    /**
     * Этот fix нужнен, потому что возвращается instance Carbon
     */
    public function getUpdatedAtAttribute($value)
 	{
 		return $value;
 	}

    /**
     * Вход пользователя
     */
    public static function login($data)
    {
        $query = dbEgecrm('users')->where('email', $data['login']);

         # проверка логина
        if ($query->exists()) {
            $user_id = $query->value('id_entity');
        } else {
            // self::log(null, 'failed_login', 'неверный логин', ['login' => $data['login']]);
            return false;
        }

        # проверка пароля
        $query->where('password', static::_password($data['password']));
        if (! $query->exists()) {
            // self::log($user_id, 'failed_login', 'неверный пароль');
            return false;
        }

        $user = self::find($query->value('id_entity'));

        # забанен ли?
        if ($user->isBanned()) {
            // self::log($user_id, 'failed_login', 'пользователь заблокирован');
        } else {
            $allowed_to_login = $user->allowedToLogin();

            # из офиса или есть доступ вне офиса
            if ($allowed_to_login) {
                # дополнительная СМС-проверка, если пользователь логинится если не из офиса
                if ($allowed_to_login->confirm_by_sms) {
                    $sent_code = Redis::get("wstat:codes:{$user_id}");
                    // если уже был отправлен – проверяем
                    if (! empty($sent_code)) {
                        if (@$data['code'] != $sent_code) {
                            // self::log($user_id, 'failed_login', 'неверный смс-код');
                            return false;
                        } else {
                            Redis::del("wstat:codes:{$user_id}");
                        }
                    } else {
                        // иначе отправляем код
                        // self::log($user_id, 'sms_code_sent');
                        Sms::verify($user);
                        return 'sms';
                    }
                }
                // self::log($user_id, 'success_login');
                $user->toSession();
                setcookie("logged_user", json_encode([
					'email' => $data['login']
				]), time() + (3600 * 24 * 365), "/");
                return true;
            } else {
                // self::log($user_id, 'failed_login', 'нет прав доступа для данного IP');
            }
        }
        return false;
    }

    public static function _password($password)
	{
		$password = md5($password."_rM");
        $password = md5($password."Mr");
		return $password;
	}


    public static function logout()
    {
        unset($_SESSION['user']);
    }

    /*
	 * Проверяем, залогинен ли пользователь
	 */
	public static function loggedIn()
	{
        return isset($_SESSION["user"]) && $_SESSION["user"] 	// пользователь залогинен
            && ! User::fromSession()->isBanned()      			// и не заблокирован
            && User::fromSession()->allowedToLogin() 			// и можно входить
            && User::notChanged();      						// и данные по пользователю не изменились
	}

    /*
	 * Пользователь из сессии
	 * @boolean $init – инициализировать ли соединение с БД пользователя
	 * @boolean $update – обновлять данные из БД
	 */
	public static function fromSession($upadte = false)
	{
		// Если обновить данные из БД, то загружаем пользователя
		if ($upadte) {
			$User = User::find($_SESSION["user"]->id);
			$User->toSession();
		} else {
			// Получаем пользователя из СЕССИИ
			$User = $_SESSION['user'];
		}

		// Возвращаем пользователя
		return $User;
	}

    public static function id()
    {
        return User::fromSession()->id;
    }

    /**
     * Текущего пользователя в сессию
     */
    public function toSession()
    {
        $_SESSION['user'] = $this;
    }

    /**
     * Get real users
     *
     */
    public static function scopeReal($query)
    {
        return $query->where('type', static::USER_TYPE);
    }

    /**
     * Get real users
     *
     */
    public static function scopeActive($query)
    {
        return $query->whereRaw('NOT FIND_IN_SET(' . \Shared\Rights::WSTAT_BANNED . ', rights)');
    }

    public function isBanned()
    {
        return $this->allowed(\Shared\Rights::WSTAT_BANNED);
    }

    /**
     * Данные по пользователю не изменились
     * если поменяли в настройках хоть что-то, сразу выкидывает, чтобы перезайти
     */
    public static function notChanged()
    {
        return User::fromSession()->updated_at == dbEgecrm('admins')->whereId(User::id())->value('updated_at');
    }

    /**
     * User has rights to perform the action
     */
    public function allowed($right)
    {
        return in_array($right, $this->rights);
    }

    /**
	 * Можно ли логиниться с этого IP?
	 */
	public function allowedToLogin()
	{
        if (app('env') === 'local') {
            return (object)[
                'confirm_by_sms' => false
            ];
        }

        $current_ip = ip2long($_SERVER['HTTP_X_REAL_IP']);
        $admin_ips = dbEgecrm('admin_ips')->where('id_admin', $this->id)->get();
        foreach($admin_ips as $admin_ip) {
            $ip_from = ip2long(trim($admin_ip->ip_from));
            $ip_to = ip2long(trim($admin_ip->ip_to ?: $admin_ip->ip_from));
            if ($current_ip >= $ip_from && $current_ip <= $ip_to) {
                return $admin_ip;
            }
        }

        return false;
	}
}
