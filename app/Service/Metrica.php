<?php
    namespace App\Service;

    use GuzzleHttp\Client;
    use DB;

    class Metrica {
        const OAUTH_TOKEN = 'AQAAAAAD8EucAAPxmtVlKCYTtUp3imn4oHY6F3A';
        const COUNTER_ID = 1411783;
        const VISITS_FIELDS = [
            "ym:s:visitID",
            "ym:s:counterID",
            "ym:s:watchIDs",
            "ym:s:date",
            "ym:s:dateTime",
            "ym:s:dateTimeUTC",
            "ym:s:isNewUser",
            "ym:s:startURL",
            "ym:s:endURL",
            "ym:s:pageViews",
            "ym:s:visitDuration",
            "ym:s:bounce",
            "ym:s:ipAddress",
            "ym:s:params",
            "ym:s:goalsID",
            "ym:s:goalsSerialNumber",
            "ym:s:goalsDateTime",
            "ym:s:goalsPrice",
            "ym:s:goalsOrder",
            "ym:s:goalsCurrency",
            "ym:s:clientID",
            "ym:s:lastTrafficSource",
            "ym:s:lastAdvEngine",
            "ym:s:lastReferalSource",
            "ym:s:lastSearchEngineRoot",
            "ym:s:lastSearchEngine",
            "ym:s:lastSocialNetwork",
            "ym:s:lastSocialNetworkProfile",
            "ym:s:referer",
            "ym:s:lastDirectClickOrder",
            "ym:s:lastDirectBannerGroup",
            "ym:s:lastDirectClickBanner",
            "ym:s:lastDirectPhraseOrCond",
            "ym:s:lastDirectPlatformType",
            "ym:s:lastDirectPlatform",
            "ym:s:lastDirectConditionType",
            "ym:s:lastCurrencyID",
            "ym:s:from",
            "ym:s:UTMCampaign",
            "ym:s:UTMContent",
            "ym:s:UTMMedium",
            "ym:s:UTMSource",
            "ym:s:UTMTerm",
            "ym:s:openstatAd",
            "ym:s:openstatCampaign",
            "ym:s:openstatService",
            "ym:s:openstatSource",
            "ym:s:hasGCLID",
            "ym:s:regionCountry",
            "ym:s:regionCity",
            "ym:s:browserLanguage",
            "ym:s:browserCountry",
            "ym:s:clientTimeZone",
            "ym:s:deviceCategory",
            "ym:s:mobilePhone",
            "ym:s:mobilePhoneModel",
            "ym:s:operatingSystemRoot",
            "ym:s:operatingSystem",
            "ym:s:browser",
            "ym:s:browserMajorVersion",
            "ym:s:browserMinorVersion",
            "ym:s:browserEngine",
            "ym:s:browserEngineVersion1",
            "ym:s:browserEngineVersion2",
            "ym:s:browserEngineVersion3",
            "ym:s:browserEngineVersion4",
            "ym:s:cookieEnabled",
            "ym:s:javascriptEnabled",
            "ym:s:flashMajor",
            "ym:s:flashMinor",
            "ym:s:screenFormat",
            "ym:s:screenColors",
            "ym:s:screenOrientation",
            "ym:s:screenWidth",
            "ym:s:screenHeight",
            "ym:s:physicalScreenWidth",
            "ym:s:physicalScreenHeight",
            "ym:s:windowClientWidth",
            "ym:s:windowClientHeight",
            "ym:s:purchaseID",
            "ym:s:purchaseDateTime",
            "ym:s:purchaseAffiliation",
            "ym:s:purchaseRevenue",
            "ym:s:purchaseTax",
            "ym:s:purchaseShipping",
            "ym:s:purchaseCoupon",
            "ym:s:purchaseCurrency",
            "ym:s:purchaseProductQuantity",
            "ym:s:productsPurchaseID",
            "ym:s:productsID",
            "ym:s:productsName",
            "ym:s:productsBrand",
            "ym:s:productsCategory",
            "ym:s:productsCategory1",
            "ym:s:productsCategory2",
            "ym:s:productsCategory3",
            "ym:s:productsCategory4",
            "ym:s:productsCategory5",
            "ym:s:productsVariant",
            "ym:s:productsPosition",
            "ym:s:productsPrice",
            "ym:s:productsCurrency",
            "ym:s:productsCoupon",
            "ym:s:productsQuantity",
            "ym:s:impressionsURL",
            "ym:s:impressionsDateTime",
            "ym:s:impressionsProductID",
            "ym:s:impressionsProductName",
            "ym:s:impressionsProductBrand",
            "ym:s:impressionsProductCategory",
            "ym:s:impressionsProductCategory1",
            "ym:s:impressionsProductCategory2",
            "ym:s:impressionsProductCategory3",
            "ym:s:impressionsProductCategory4",
            "ym:s:impressionsProductCategory5",
            "ym:s:impressionsProductVariant",
            "ym:s:impressionsProductPrice",
            "ym:s:impressionsProductCurrency",
            "ym:s:impressionsProductCoupon",
            "ym:s:lastDirectClickOrderName",
            "ym:s:lastClickBannerGroupName",
            "ym:s:lastDirectClickBannerName",
            "ym:s:networkType"
        ];
        const SOURCE_VISITS = 'visits';
        const API_URL = 'https://api-metrika.yandex.ru/management/v1/counter/';

        public static function generate($start_date, $end_date)
        {
            $response = (new Client)->post(self::_url('logrequests'), [
                'form_params' => [
                    'date1'       => $start_date,
                    'date2'       => $end_date,
                    'fields'      => implode(',', self::VISITS_FIELDS),
                    'source'      => self::SOURCE_VISITS,
                    'oauth_token' => self::OAUTH_TOKEN
                ]
            ]);
            return self::_response($response)->log_request->request_id;
        }

        public static function download($request_id, $part = 0)
        {
            $response = (new Client)->get(self::_url("logrequest/{$request_id}/part/{$part}/download"), [
                'query' => [
                    'oauth_token' => self::OAUTH_TOKEN
                ]
            ]);
            // \Storage::disk('public')->put('response.txt', $response->getBody()->getContents());
            foreach(explode(PHP_EOL, $response->getBody()->getContents()) as $line_number => $line) {
                // пропускаем заголовки и пустые строки (последняя)
                if ($line_number == 0 || empty(trim($line))) {
                    continue;
                }
                $data = [];
                foreach(explode("\t", $line) as $index => $value) {
                    $field = explode(':', self::VISITS_FIELDS[$index])[2];
                    $data[$field] = $value;
                }
                DB::table('metrica_visits')->insert($data);
            }
        }

        private static function _url($additional = null)
        {
            return self::API_URL . self::COUNTER_ID . ($additional ? "/{$additional}" : '');
        }

        private static function _response($response)
        {
            return json_decode($response->getBody()->getContents());
        }
    }
