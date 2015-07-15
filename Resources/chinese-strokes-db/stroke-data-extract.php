<?php

define('PUBLICPATH',__DIR__. '/');

function getChinaLine() {
    $handle = fopen(PUBLICPATH . "stroke-count-db.txt", "r");
    $data = array();
    if ($handle) {
        while (($line = fgets($handle)) !== false) {
            $arr = preg_split('/[\s]+/', $line);
            $code = strtoupper($arr[0]);
            $code = str_replace('U+', '', $code);
            $data[$code][$arr[1]] = $arr[2];
        }

        fclose($handle);
    }

    $handle = fopen(PUBLICPATH . "dictionary.txt", "r");

    if ($handle) {
        while (($line = fgets($handle)) !== false) {
            $arr = explode('|', $line);
            $code = strtoupper(trim($arr[0]));
            $data[$code]['type'] = trim($arr[1]);
            
            $char_type  =  $data[$code]['type'];
            
            switch ($char_type) {
                case 0:
                    break;
                case 1 : // Traditional Char
                    
                    break;
                
                case 2: 
                    break;
                
                default: // both
                    unlink($data[$code]);
                    break;
            }
        }
        fclose($handle);
    }

        
    $obj = json_encode($data);
    $fp = fopen(PUBLICPATH . 'chinakeyword.json', 'w');
    fwrite($fp, $obj);
    fclose($fp);
}

getChinaLine();


