<?php

namespace App\Service;

class Wordstat {

    public $page;

    public function __construct($keyphrase)
    {
        $this->cookie = config('direct.wordstat-cookie');
        $this->agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
        $this->keyphrase = $keyphrase;
        $this->page = 1;
    }

    public static function getData($keyphrase)
    {
        $w = new Wordstat($keyphrase);

        $page = 1;
        $items = [];
        do {
            $data = $w->getNextPage();
            $page_items = $data['content']['includingPhrases']['items'];
            if ($page_items && count($page_items)) {
                $items = array_merge($items, $page_items);
            }
            if (($data['content']['hasNextPage'] == 'yes')) {
                sleep(1);
            } else {
                return $items;
            }
        } while (true);

        return $items;
    }

    private function getNextPage()
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->request('POST', 'https://wordstat.yandex.ru/stat/words', [
            'headers' => [
                'Accept' => 'application/json, text/javascript, */*; q=0.01',
                'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie' => $this->cookie,
                'User-Agent' => $this->agent,
            ],
            'form_params' => [
                'db' => '',
                'filter' => 'all',
                'map' => 'world',
                'page' => $this->page,
                'page_type' => 'words',
                'period' => 'monthly',
                'regions' => '1', // 255 Москва
                'sort' => 'cnt',
                'type' => 'list',
                'words' => $this->keyphrase
            ]
        ]);

        $raw = $response->getBody()->getContents();
        \Log::info("Query page {$this->page}");
        $this->page++;

        return $this->decode($raw);
    }

    function decode($in) {
       $out = '';
       if (preg_match('~fuid01=(.*?);~', $this->cookie, $m))
           $fuid01 = $m[1];
       else
           die("no fuid01\n");
       if ($arr = json_decode($in, true)) {
           if (isset($arr['key']) && isset($arr['data'])) {
               $magicHash = substr($this->agent, 0, 25) . $fuid01 . $this->parse($arr['key']);
               $data_len = strlen($arr['data']);
               $magicHash_len = strlen($magicHash);
               for ($i = 0; $i < $data_len; $i++)
                   $out.= chr((ord($arr['data'][$i]) ^ ord($magicHash[$i % $magicHash_len])));
               $out = urldecode($out);
               $out = json_decode($out, true);
           }
           else
               die(print_R($arr, true));
       }
       return $out;
   }

   function parse($str) {
       $str = $this->parse_math($str);
       $str = $this->parse_method($str);
       $str = $this->parse_vars($str);
       $str = $this->parse_function($str);
       return $str;
   }

   function parse_inline($str) {
       while (preg_match('~return\s*function\s*\(\s*(.*?)\s*\)\s*\{(.*?)\}\s*\((".*?")\)~', $str, $m)) {
           $str = $m[2];
           $str = str_replace($m[1] . '.', $m[3] . '.', $str);
           foreach ($this->vars as $key => $value) {
               $str = str_replace($key . '.', '"' . $value . '".', $str);
           }
           $str = $this->parse_method($str);
       }
       while (preg_match('~return\s*function\s*\(\s*\)\s*\{(.*?)\}\s*$~', $str, $m)) {
           $str = $m[1];
           foreach ($this->vars as $key => $value) {
               $str = str_replace($key . '.', '"' . $value . '".', $str);
           }
           $str = $this->parse_method($str);
       }
       $str = preg_replace('~^\s*return\s*"(.*?)"\s*$~', '$1', $str);
       return $str;
   }

   function parse_function($str) {
       if (preg_match('~([;\s])([a-z0-9]+)\s*\(\s*"(.*?)"\s*\)[\s;]*~', $str, $m)) {
           $str = str_replace($m[0], $m[1], $str);
           $func = $m[2];
           $args = $m[3];
           if (preg_match('~var ' . $func . '\s*=\s*function\s*\((.*?)\)\s*\{\s*(.*?)\s*\}\s*;\s*~', $str, $m)) {
               $this->vars[$m[1]] = $args;
               $str = $m[2];
               $str = $this->parse_vars($str);
               $str = $this->parse_inline($str);
           }
       } elseif (preg_match('~([;\s])([a-z0-9]+)\s*\(\s*\)[\s;]*$~', $str, $m)) {
           $str = str_replace($m[0], $m[1], $str);
           $func = $m[2];
           if (preg_match('~var ' . $func . '\s*=\s*function\s*\((.*?)\)\s*\{\s*(.*?)\s*\}\(\s*(.*?)\s*\)\s*;\s*~', $str, $m)) {
               if (preg_match('~^"(.*?)"$~', $m[3], $n)) {
                   $m[3] = $n[1];
               }
               $this->vars[$m[1]] = $m[3];
               $str = $m[2];
               $str = $this->parse_vars($str);
               $str = $this->parse_inline($str);
           }
       } else {
           die("[stop] " . $str . "\n");
       }
       return $str;
   }

   function parse_vars($str) {
       while (preg_match('~var\s+([a-z0-9]+)\s*=\s*"([a-z0-9]+)"[;\s]~', $str, $m)) {
           $str = str_replace($m[0], '', $str);
           $this->vars[$m[1]] = $m[2];
       }
       while (preg_match('~var\s+([a-z0-9]+)\s*=\s*([a-z0-9]+)[;\s]~', $str, $m)) {
           if (isset($this->vars[$m[2]])) {
               $str = str_replace($m[0], '', $str);
               $this->vars[$m[1]] = $this->vars[$m[2]];
           } else {
               break;
           }
       }
       return $str;
   }

   function parse_method($str) {
       $mark = 'internalvariable';
       $var = '';
       while (preg_match('~"([a-z0-9]+)"\.([a-z]+)\s*\(\s*([\'"a-z0-9\-]+)*\s*\)~', $str, $m)) {
           if ($m[1] != $mark || $var == '') {
               if (!empty($var))
                   $str = str_replace('"' . $mark . '"', $var, $str);
               $var = $m[1];
           }
           switch ($m[2]) {
               case 'split':
                   $m[3] = preg_replace('~^\'(.*?)\'$~', '$1', $m[3]);
                   if ($m[3] == '') {
                       $var = str_split($var);
                   } else {
                       $var = explode($m[3], $var);
                   }
                   $str = str_replace($m[0], '"' . $mark . '"', $str);
                   break;
               case 'join':
                   $m[3] = preg_replace('~^\'(.*?)\'$~', '$1', $m[3]);
                   if ($m[3] == '') {
                       $var = join($var);
                   } else {
                       $var = implode($m[3], $var);
                   }
                   $str = str_replace($m[0], '"' . $mark . '"', $str);
                   break;
               case 'reverse':
                   if (is_array($var))
                       $var = array_reverse($var);
                   else
                       $var = strrev($var);
                   $str = str_replace($m[0], '"' . $mark . '"', $str);
                   break;
               case 'concat':
                   if (preg_match('~[a-z]~', $m[3]) && isset($this->vars[$m[3]])) {
                       $var = $var . $this->vars[$m[3]];
                   } else {
                       $var = $var . $m[3];
                   }
                   $str = str_replace($m[0], '"' . $mark . '"', $str);
                   break;
               case 'substr':
                   $var = substr($var, $m[3]);
                   $str = str_replace($m[0], '"' . $mark . '"', $str);
                   break;
               default:
                   die('method not found: ' . print_R($m, true));
           }
       }
       $str = str_replace($mark, $var, $str);
       return $str;
   }

   function parse_math($str) {
       while (preg_match('~\(([0-9]+)\s*\^\s*([0-9]+)\)~', $str, $m)) {
           $str = str_replace($m[0], "(" . (string) ((int) $m[1] ^ (int) $m[2]) . ")", $str);
       }
       return $str;
   }
}
