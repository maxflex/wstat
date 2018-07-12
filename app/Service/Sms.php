<?php

namespace App\Service;

use Illuminate\Support\Facades\Redis;

class Sms
{
	public static function sendToNumbers($numbers, $message, $mass) {
		foreach ($numbers as $number) {
			self::send($number, $message, $mass);
		}
	}


	public static function send($to, $message, $mass)
	{
		$to = explode(",", $to);
		foreach ($to as $number) {
			$number = cleanNumber($number);
			$number = trim($number);
			if (!preg_match('/[0-9]{10}/', $number)) {
				continue;
			}
			$params = array(
				"login"		=> config('sms.login'),
				"psw"		=> config('sms.psw'),
                "fmt"       => 1, // 1 – вернуть ответ в виде чисел: ID и количество SMS через запятую (1234,1)
                "charset"   => "utf-8",
				"phones"	=> $number,
				"mes"		=> $message,
				"sender"    => "EGE-Repetit",
			);
			$result = self::exec(config('sms.host'), $params);
		}


		return $result;
	}

	protected static function exec($url, $params, $mass = false)
	{
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_TIMEOUT, 30);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		$result = curl_exec($ch);
		curl_close($ch);
	}


	public function getStatus()
	{
		return static::textStatus($this->id_status);
	}

	/**
	 * Получить текстовый статус в зависимости от когда СМС.
	 *
	 */
	public static function textStatus($sms_status)
	{
		// Статусы тут: http://sms.ru/?panel=api&subpanel=method&show=sms/status
		switch ($sms_status) {
			case -2 : return "не доставлено";
			case 100: return "в очереди";
			case 101: return "передается оператору";
			case 102: return "в пути";
			case 103: return "доставлено";
			case 104: return "время жизни истекло";
			case 105: return "удалено оператором";
			case 106: return "сбой в телефоне";
			case 107: return "не доставлено";
			case 108: return "отклонено";
			case 207: return "недопустимый номер";
			default:  return "неизвестно";
		}
	}

    /**
     *
     */
    public static function verify($user)
    {
        $code = mt_rand(10000, 99999);
        Redis::set("wstat:codes:{$user->id}", $code, 'EX', 120);
        Sms::send($user->phone, $code . ' – код для входа в ЛК', false);
        // cache(["codes:{$user_id}" => $code], 3);
        return $code;
    }
}
