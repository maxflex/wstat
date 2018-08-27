<?php

namespace App\Models;


use \Shared\Model;
use App\Service\SessionService;
use Illuminate\Support\Facades\Redis;

class User extends Model
{
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

    public static function _password($password)
	{
		$password = md5($password."_rM");
        $password = md5($password."Mr");
		return $password;
	}


    public static function logout()
    {
        if (isset($_SESSION["user"]) && $_SESSION["user"]) {
            SessionService::destroy();
            unset($_SESSION['user']);
        }
        // session_destroy();
        // session_unset();
        // removeCookie("PHPSESSID", "/");
        // setcookie("PHPSESSID", "", time()-3600, "/");
    }

    /*
	 * Проверяем, залогинен ли пользователь
	 */
	public static function loggedIn()
	{
        return isset($_SESSION["user"]) && $_SESSION["user"]    // пользователь залогинен
            && ! User::fromSession()->isBanned()                // и не заблокирован
            && User::notChanged()                               // и данные по пользователю не изменились
            && SessionService::exists();
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
}
