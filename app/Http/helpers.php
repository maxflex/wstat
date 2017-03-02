<?php
    function dateRange($strDateFrom, $strDateTo)
    {
        $aryRange=array();

        $iDateFrom=mktime(1,0,0,substr($strDateFrom,5,2),     substr($strDateFrom,8,2),substr($strDateFrom,0,4));
        $iDateTo=mktime(1,0,0,substr($strDateTo,5,2),     substr($strDateTo,8,2),substr($strDateTo,0,4));

        if ($iDateTo>=$iDateFrom)
        {
            array_push($aryRange,date('Y-m-d',$iDateFrom)); // first entry
            while ($iDateFrom<$iDateTo)
            {
                $iDateFrom+=86400; // add 24 hours
                array_push($aryRange,date('Y-m-d',$iDateFrom));
            }
        }
        return $aryRange;
    }

    function preType($Object)
    {
        echo '<pre>';
        print_r($Object);
        echo '</pre>';
    }

    function emptyObject()
    {
        return (object)[];
    }

    /**
	 * Форматировать дату в наш формат.
	 *
	 */
	function dateFormat($date, $notime = false)
	{
		$date = date_create($date);
		return date_format($date, $notime ? "d.m.Y" : "d.m.Y в H:i");
	}

    /**
     * Деформатировать дату
     */
    function fromDotDate($date)
    {
        $parts = explode('.', $date);
        return implode('-', array_reverse($parts));
    }

    /**
     * Возвратить чистый номер телефона.
     *
     */
    function cleanNumber($number, $add_seven = false)
    {
        return ($add_seven ? '7' : '') . preg_replace("/[^0-9]/", "", $number);
    }

    /**
     * Пребежать по номерам телефона
     * функция должна возвращать номер телефона
     * @example throughNumbers($tutor, function($number)) {
     *              return $number . '123';
     *          }
     *
     */
    function throughNumbers(&$object, $func)
    {
        foreach (App\Traits\Person::$phone_fields as $phone_field) {
            $object->{$phone_field} = $func($object->{$phone_field});
        }
    }

    /**
     * Очистить номера телефонов у объекта
     */
    function cleanNumbers(&$object)
    {
        throughNumbers($object, 'cleanNumber');
    }

    /*
	 * В формат ангуляра
	 */
	function ngInitOne($name, $Object)
	{
		return $name." = ".htmlspecialchars(json_encode($Object, JSON_NUMERIC_CHECK)) ."; ";
	}

	/*
	 * Инициализация переменных ангуляра
	 * $array – [var_name = {var_values}; ...]
	 * @return строка вида 'a = {test: true}; b = {var : 12};'
	 */
	function ngInit($array)
	{
        $return = '';
		foreach ($array as $var_name => $var_value) {
			// Если значение не установлено, то это пустой массив по умолчанию
			// if (!$var_value && !is_int($var_value)) {
			// 	$var_value = "[]";
			// } else {
				// иначе кодируем объект в JSON
				// $var_value = htmlspecialchars(json_encode($var_value, JSON_NUMERIC_CHECK));
				$var_value = htmlspecialchars(json_encode($var_value, JSON_FORCE_OBJECT));
			// }
			$return .= $var_name." = ". $var_value ."; ";
		}

		return ['nginit' => $return];
	}

    function isProduction()
    {
        return app()->environment() == 'production';
    }

    /**
     * Возвратить user id из сесси или 0 (system)
     */
    function userIdOrSystem()
    {
        return \App\Models\User::loggedIn() ? \App\Models\User::fromSession()->id : 0;
    }

    function now($no_time = false)
    {
        return date('Y-m-d' . ($no_time ? '' : ' H:i:s'));
    }

    function isBlank($value) {
        return empty($value) && !is_numeric($value);
    }

    function notBlank($value) {
        return ! isBlank($value);
    }

    function isFilled($value)
    {
        return (isset($value) && ! empty($value));
    }

    /**
     * Разбить enter'ом
     */
    function breakLines($array)
    {
        return implode('

', array_filter($array));
    }


    /**
     * Удалить пустые строки
     */
    function filterParams($a)
    {
        return (object)array_filter((array)$a, function($e) {
            return $e !== '';
        });
    }

    function pluralize($one, $few, $many, $n)
	{
		$text = $n%10==1&&$n%100!=11?$one:($n%10>=2&&$n%10<=4&&($n%100<10||$n%100>=20)?$few:$many);
        return $n . ' ' . $text;
	}

    /**
     * @param $table
     * @param null $select
     * @param null $orderBy
     * @example
     * fact('stations', 'title', 'title')               order by title, ascending sorting by default.
     * fact('stations', 'title', ['title', 'desc'])     order by title, descending.
    */
    function fact($table, $select = null, $orderBy = null)
    {
        return \App\Models\Service\Factory::json($table, $select, $orderBy);
    }

    function camelize($input, $separator = '_')
    {
        return str_replace($separator, '', ucwords($input, $separator));
    }

    function allowed($right, $return_int = false)
   {
       $allowed = \App\Models\User::fromSession()->allowed($right);
       return $return_int ? (int)$allowed : $allowed;
   }
