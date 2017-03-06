<?php

namespace App\Service;

class YandexDirect
{
    const API_URL   = 'https://api.direct.yandex.ru/live/v4/json/';
    const LOCALE = 'ru';
    const MOSCOW_GEO_ID = 213;
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

    /**
     * Получить частотность фраз
     */
    public static function getFrequencies($phrases)
    {
        # кодируем фразы в UTF-8
        foreach ($phrases as &$phrase) {
            $phrase = utf8_encode($phrase);
        }

        # создаем отчет
        $data = self::exec('CreateNewForecast', [
            'GeoID' => [self::MOSCOW_GEO_ID],
            'Phrases' => $phrases
        ]);

        if (isset($data->error_code)) {
            return join('<br>', explode('. ', $data->error_detail));
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

        $return = [];
        foreach($response->data->Phrases as $phrase) {
            $return[] = $phrase->Shows;
        }
        return $return;
    }
}

?>
