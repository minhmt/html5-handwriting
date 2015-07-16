<?php

define('PUBLICPATH', __DIR__ . '/');

$data = array(); // all dictionary chars
$aData  =   array(); // all dictionary  chars
$sData = array(); // simplified chars
$tData = array(); //traditional chars

$handle = fopen(PUBLICPATH . "stroke-count-db.txt", "r");

if ($handle) {
    while (($line = fgets($handle)) !== false) {
        $arr = preg_split('/[\s]+/', $line);
        $code = strtoupper($arr[0]);
        $code = str_replace('U+', '', $code);
        if ($arr[1] == 'kTotalStrokes') {
            $data[$code]['strokeCount'] = $arr[2];
        }
    }

    fclose($handle);
}

$handle = fopen(PUBLICPATH . "dictionary.txt", "r");

if ($handle) {
    while (($line = fgets($handle)) !== false) {
        $arr = explode('|', $line);
        $code = strtoupper(trim($arr[0]));
        $data[$code]['type'] = (int)trim($arr[1]);

        $char_type = $data[$code]['type'];

        switch ($char_type) {
            case 0:
                $sData[$data[$code]['strokeCount']][] = $code;
                $tData[$data[$code]['strokeCount']][] = $code;
                
                $aData[$data[$code]['strokeCount']][] = $code;
                
                break;
            case 1 : // simplified Char
                $sData[$data[$code]['strokeCount']][] = $code;
                $tData[$data[$code]['strokeCount']][] =  trim($arr[2]);                

                $aData[$data[$code]['strokeCount']][] = $code;
                
                break;

            case 2:  // traditional
                
                $tData[$data[$code]['strokeCount']][] = $code;
                $sData[$data[$code]['strokeCount']][] = trim($arr[2]);
                $aData[$data[$code]['strokeCount']][] = $code;

                break;

            default: // both
                $aData[$data[$code]['strokeCount']][] = $code;
                unset($data[$code]);
                break;
        }
    }
    fclose($handle);

    writeTo($aData, 'alldict.json');
    writeTo($sData, 'sdict.json');
    writeTo($tData, 'tdict.json');
    
    
    saveStrokeData($aData,'all');
    saveStrokeData($sData,'simplified');
    saveStrokeData($tData,'traditional');
}

function writeTo($data,$to_file) {
    $obj = json_encode($data);
    $fp = fopen(PUBLICPATH . $to_file, 'w');
    fwrite($fp, $obj);
    fclose($fp);
}

function saveStrokeData($data,$folder) {
    foreach ($data as $strokeCount => $chars) {
        $obj = json_encode($chars);
        $fp = fopen(PUBLICPATH . $folder.'/'.$strokeCount.'.json', 'w');
        fwrite($fp, $obj);
        fclose($fp);
    }
}


