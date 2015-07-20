<?php

define('PUBLICPATH', __DIR__ . '/');

$data=  array();

$fcontent  = file_get_contents(PUBLICPATH.'handwriting-zh_TW.xml');
$xml = new SimpleXMLElement($fcontent);

/* Search for <a><b><c> */
$dict = $xml->xpath('/character-collection/set/character');

$i=0;

while(list( , $char) = each($dict)) {
   
   $strokeCount =   count($char->strokes->stroke);
   $charCode    =   $char->utf8;
   
   $strokes_array  =   array();
   $strokes =   $char->strokes->stroke;
  // process strokes data
   foreach ($strokes as $stroke) {
       $strokes_array[]   = count($stroke->point);
   }
   
   $data[]  =   array('code' => $charCode,
                      'strokeCount' => $strokeCount,
                      'strokeOrder' => $strokes_array
                        );
   
   if ($i>10)  break;
   $i++;
   
   echo $char->utf8;
}

var_dump($data);

echo 'Char numbers:'. count($dict);