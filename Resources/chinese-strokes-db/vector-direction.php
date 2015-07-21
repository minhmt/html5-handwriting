<?php
//Vector direction

$a =   array('x' => 5, 'y' => 5);

$b = array('x' =>10, 'y' => 10);

$lenA = sqrt($a['x'] * $a['x'] + $a['y'] * $a['y']);
$lenB = sqrt($b['x'] * $b['x'] + $b['y'] * $b['y']);

$arg    =  ($a['x'] * $b['x'] + $a['y']*$b['y'])/ ($lenA * $lenB);


$angle  =   acos($arg);

echo "the angle beetween two Vector V1(". $a['x'].','.$a['y'].") - V2(". $b['x'].','.$b['y'].") is : ".$angle;

echo "\r\n". angle_between($a,$b);



    function angle_between($a, $b) {
        return acos(($a['x'] * $b['x'] + $a['y'] * $b['y']) / (len($a) * len($b)));
    }

    function len($v) {
        return sqrt($v['x'] * $v['x'] + $v['y'] * $v['y']);
    }
