<?php

namespace App\Service;

class YandexDirect
{
    // const API_URL   = 'https://api.direct.yandex.ru/live/v4/json/';
    const API_URL   = 'https://api.direct.yandex.com/json/v5/';
    const LOCALE = 'ru';
    // const MOSCOW_GEO_ID = 213;      // москва
    // const MOSCOW_REGION_GEO_ID = 1; // москва и область
    const TRIALS = 50; // попыток запроса статистики
    const SLEEP  = 2; // секунд между попытками

    public static function exec($method, $param = [])
    {
        $post_data = [
            'method' => $method,
            'locale' => self::LOCALE,
            'token' => config('direct.token'),
            'param' => $param,
        ];

        $ch = curl_init(self::API_URL);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER 	=> true,
            CURLOPT_POST			=> true,
            CURLOPT_POSTFIELDS		=> json_encode($post_data),
        ]);

        $response = curl_exec($ch);
        // $code     = curl_getinfo($ch)['http_code'];

        curl_close($ch);
        \Log::info($response);
        return json_decode($response);
    }

    public static function exec2($method, $param = [])
    {
        $post_data = [
            'method' => $method,
            'locale' => self::LOCALE,
            'token' => config('direct.token'),
            'param' => $param,
        ];

        $ch = curl_init(self::API_URL);

        $headers = [
            'Content-type: application/xml',
            'Authorization: gfhjui'
        ];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER 	=> true,
            CURLOPT_POST			=> true,
            CURLOPT_POSTFIELDS		=> json_encode($post_data),
            CURLOPT_HTTPHEADER      => $headers,
        ]);

        $response = curl_exec($ch);
        // $code     = curl_getinfo($ch)['http_code'];

        curl_close($ch);
        \Log::info($response);
        return json_decode($response);
    }

    public static function run()
    {
        return self::exec('campaigns');
    }

    /**
     * Получить частотность фраз
     */
    public static function getFrequencies($phrases, $region_id)
    {
        $return = [];

        # кодируем фразы в UTF-8
        foreach ($phrases as &$phrase) {
            $phrase = utf8_encode($phrase);
        }

        # создаем отчет
        $data = self::exec('CreateNewForecast', [
            'GeoID' => [$region_id],
            'Phrases' => $phrases
        ]);

        if (isset($data->error_code)) {
            return join('<br>', explode('. ', $data->error_str));
        } else {
            $forecast_id = $data->data;
        }

        # дожидаемся создания отчета и получаем отчет
        $trial = 1; // первая попытка
        while ($trial <= static::TRIALS) {
            $response = self::exec('GetForecast', $forecast_id);
            if (isset($response->data)) {
                break;
            }
            $trial++;
            sleep(static::SLEEP);
        }

        if (! isset($response->data)) {
            return 'время ожидания истекло';
        }

        foreach($response->data->Phrases as $phrase) {
            $return[] = $phrase->Shows;
        }

        return $return;
    }
}

?>
