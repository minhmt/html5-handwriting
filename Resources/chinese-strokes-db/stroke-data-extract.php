<!DOCTYPE html>
<html>
    <head>        
         <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    </head>
    <body>
        
<?php



define('PUBLICPATH', __DIR__ . '/');

$data = array(); // all dictionary chars
$aData  =   array(); // all dictionary  chars
$sData = array(); // simplified chars
$tData = array(); //traditional chars


if (!function_exists('codepoint_encode')) {

    function codepoint_encode($str) {
        return substr(json_encode($str), 1, -1);
    }

}

if (!function_exists('codepoint_decode')) {

    function codepoint_decode($str) {
        return json_decode(sprintf('"%s"', $str));
    }

}

if (!function_exists('mb_internal_encoding')) {

    function mb_internal_encoding($encoding = NULL) {
        return ($from_encoding === NULL) ? iconv_get_encoding() : iconv_set_encoding($encoding);
    }

}

if (!function_exists('mb_convert_encoding')) {

    function mb_convert_encoding($str, $to_encoding, $from_encoding = NULL) {
        return iconv(($from_encoding === NULL) ? mb_internal_encoding() : $from_encoding, $to_encoding, $str);
    }

}

if (!function_exists('mb_chr')) {

    function mb_chr($ord, $encoding = 'UTF-8') {
        if ($encoding === 'UCS-4BE') {
            return pack("N", $ord);
        } else {
            return mb_convert_encoding(mb_chr($ord, 'UCS-4BE'), $encoding, 'UCS-4BE');
        }
    }

}

if (!function_exists('mb_ord')) {

    function mb_ord($char, $encoding = 'UTF-8') {
        if ($encoding === 'UCS-4BE') {
            list(, $ord) = (strlen($char) === 4) ? @unpack('N', $char) : @unpack('n', $char);
            return $ord;
        } else {
            return mb_ord(mb_convert_encoding($char, 'UCS-4BE', $encoding), 'UCS-4BE');
        }
    }

}

if (!function_exists('mb_htmlentities')) {

    function mb_htmlentities($string, $hex = true, $encoding = 'UTF-8') {
        return preg_replace_callback('/[\x{80}-\x{10FFFF}]/u', function ($match) use ($hex) {
            return sprintf($hex ? '&#x%X;' : '&#%d;', mb_ord($match[0]));
        }, $string);
    }

}

if (!function_exists('mb_html_entity_decode')) {

    function mb_html_entity_decode($string, $flags = null, $encoding = 'UTF-8') {
        return html_entity_decode($string, ($flags === NULL) ? ENT_COMPAT | ENT_HTML401 : $flags, $encoding);
    }

}

      

echo "\nGet string from numeric DEC value\n";
var_dump(mb_chr(25105));
var_dump(mb_chr(22909));

echo "\nGet string from numeric HEX value\n";
var_dump(mb_chr(0x6211));
var_dump(mb_chr(0x597D));

echo "\nGet numeric value of character as DEC int\n";
var_dump(mb_ord('我'));
var_dump(mb_ord('好'));

echo "\nGet numeric value of character as HEX string\n";
var_dump(dechex(mb_ord('我')));
var_dump(dechex(mb_ord('好')));

echo "\nEncode / decode to DEC based HTML entities\n";
var_dump(mb_htmlentities('我好', false));
var_dump(mb_html_entity_decode('&#25105;&#22909;'));

echo "\nEncode / decode to HEX based HTML entities\n";
var_dump(mb_htmlentities('我好'));
var_dump(mb_html_entity_decode('&#x6211;&#x597D;'));

echo "\nUse JSON encoding / decoding\n";
var_dump(codepoint_encode("我好"));

$code   =   '4E00';
$testchar   =   '\u' . $code;
$text   =   sprintf(codepoint_decode($testchar));
echo ($text);
        
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
        
        $decode =   utf8_decode('u'+$code);
        
        $data[$code]['type'] = (int)trim($arr[1]);

        $char_type = $data[$code]['type'];

        $decCode    =   utf8ToDec($code);
        
        switch ($char_type) {
            case 0:
                $sData[$data[$code]['strokeCount']][] = $decCode;
                $tData[$data[$code]['strokeCount']][] = $decCode;
                $aData[$data[$code]['strokeCount']][] = $decCode;
                
                break;
            case 1 : // simplified Charsss
                $sData[$data[$code]['strokeCount']][] = $decCode;
                $tData[$data[$code]['strokeCount']][] =  utf8ToDec(trim($arr[2]));                

                $aData[$data[$code]['strokeCount']][] = $decCode;
                
                break;

            case 2:  // traditional
                
                $tData[$data[$code]['strokeCount']][] = $decCode;
                $sData[$data[$code]['strokeCount']][] = utf8ToDec(trim($arr[2]));
                $aData[$data[$code]['strokeCount']][] = $decCode;

                break;

            default: // both
                $aData[$data[$code]['strokeCount']][] = $decCode;
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


function utf8ToDec($code) {
    $decChar   =   '\u' . $code;    
    return mb_ord(json_decode(sprintf('"%s"', $decChar)));
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


?>

    </body>
</html>

