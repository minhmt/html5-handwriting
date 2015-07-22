<?php
//Vector direction

$a =   array('x' => 495, 'y' =>183);

$b = array('x' =>483, 'y' => 843);

$lenA = sqrt($a['x'] * $a['x'] + $a['y'] * $a['y']);
$lenB = sqrt($b['x'] * $b['x'] + $b['y'] * $b['y']);

$arg    =  ($a['x'] * $b['x'] + $a['y']*$b['y'])/ ($lenA * $lenB);

echo "ARG:" . $arg;

$angle  =   acos($arg);

$dangle =   $angle * 180/pi(); // angle in degree

echo "the angle(degrees) beetween two Vector V1(". $a['x'].','.$a['y'].") - V2(". $b['x'].','.$b['y'].") is : ".$dangle;

echo "\r\n". angle_between($a,$b);

    
//angle of an vector 

    function angle($v) {
        return atan((1.0 * $v['y']) / $v['x']);
    }

    function angle_between($a, $b) {
        return acos(($a['x'] * $b['x'] + $a['y'] * $b['y']) / (len($a) * len($b)));
    }

    function len($v) {
        return sqrt($v['x'] * $v['x'] + $v['y'] * $v['y']);
    }

    function get_direction($radias) {
        if ($radias<1.5*pi() && $radias >0 ) {
            return 1;
        }
    }