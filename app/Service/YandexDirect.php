<?php

namespace App\Service;

/**
 * Репетиторы Москвы
 *
 * @author Ivan Sadovoy <igreblin@gmail.com>
 * Модуль работы с API Yandex Direct
 */

class YandexDirect {
    const YANDEX_DIRECT_URL   = 'https://api.direct.yandex.ru/v4/json/';
    const LOCALE = 'ru';

    private $connectData;
    private $curl;
    private $lastError = null;

    public function __construct() {
       $conn = array(
            "token"             => "15a8371a5523487bb38c0e3782cf995c",
            "application_id"    => "834c96e2a8694724a796dd87c3ca6adf",
            "login"             => "elenasivolobceva1502"
        );

	/*
		$conn = array(
			"token"				=> "b6860ec300864ed79e919b26c5d758ea",
			"application_id"    => "82e03621f656483fa1aa3930118a2ee2",
            "login"             => "makcyxa-k"
		);*/
        $this->connectData = $conn;
        $this->curl = Curl::getInstance();
    }

    public function getLastError() {
        return $this->lastError;
    }

    public function apiRequest($method, $param = null, $decode = true) {
        $request = $this->connectData;
        $request['method'] = $method;
        $request['locale'] = self::LOCALE;
        if ($param) $request['param'] = $param;
        $request = json_encode($request);
        $response = $this->curl->curlRequest(self::YANDEX_DIRECT_URL, array(CURLOPT_POSTFIELDS => $request));
/*
       print_r($response);
       exit("HERE");
*/
        if (!$this->curl->getLastError()) {
            $result = json_decode($response);
            if (isset($result->error_code)) {
                $this->lastError = $decode ? $result : $response;
                return null;
            } else {
                $this->lastError = null;
                return $decode ? $result : $response;
            }
        } else {
            throw new \Exception($this->curl->getLastError(true));
        }
    }

    //получение полной информации по объявлениям кампании
    public function apiGetBannersByCampaigns($campaign, $GetPhrases = 'WithPrices', $IsActive = 'Yes', $StatusArchive = 'No') {
        $method = 'GetBanners';
        return $this->apiRequest($method, array(
            'CampaignIDS' => is_array($campaign) ? $campaign : array($campaign),
            'GetPhrases' => $GetPhrases,
            'Filter' => array(
                'IsActive' => array($IsActive),
                'StatusArchive' => array($StatusArchive),
            )
        ));
    }

    //запрос формирования отчёта
    public function apiCreateNewReport($campaign, $StartDate, $EndDate, $GroupByColumns, $PositionType = null) {
        $method = 'CreateNewReport';
        $param = array(
            'CampaignID' => $campaign,
            'StartDate' => $StartDate,
            'EndDate' => $EndDate,
            'GroupByColumns' => $GroupByColumns
        );
        if ($PositionType) {
            $param['Filter'] = array('PositionType' => $PositionType);
        }
        return $this->apiRequest($method, $param);
    }

}

?>
