<?php

namespace App\Service;

/**
 * Репетиторы Москвы
 *
 * @author Ivan Sadovoy <igreblin@gmail.com>
 * Модуль работы с cUrl
 */

class Curl {
    private $ch = null;
    private static $instance = null;

    private static $CURL_COMMON_OPTIONS = array(
        CURLOPT_FAILONERROR => 1,
        CURLOPT_FOLLOWLOCATION => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_HEADER => 0,
        CURLOPT_TIMEOUT => 240,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_POST => 1,
    );

    private function __construct() {
        $this->ch = curl_init();
    }

    public function __destruct() {
        curl_close($this->ch);
    }

    public static function getInstance() {
        if (self::$instance == null)
            self::$instance = new Curl();
        return self::$instance;
    }

    public function curlRequest($url, $options = array()) {
        curl_setopt($this->ch, CURLOPT_URL, $url);
        curl_setopt_array($this->ch, self::$CURL_COMMON_OPTIONS);
        if (is_array($options)) {
            curl_setopt_array($this->ch, $options);
        }
        return curl_exec($this->ch);
    }

    public function getLastError($descr = false) {
        return !$descr ? curl_errno($this->ch) : curl_error($this->ch);
    }

    public function getHTTPCode() {
        return curl_getinfo($this->ch, CURLINFO_HTTP_CODE);
    }
}
