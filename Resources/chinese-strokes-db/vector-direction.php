<!DOCTYPE html>
<html>
    <head>
        <title>Vector Angle</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>    
<?php
//Vector direction
$axis   =   vector(0,500);
$t1 =   vector(1,1);
$t2 =   vector(0,2);

$a =   vector(410,157);
$b =   vector(553,261);
$c  =   vector(593, 534);

$lenA = sqrt($a['x'] * $a['x'] + $a['y'] * $a['y']);
$lenB = sqrt($b['x'] * $b['x'] + $b['y'] * $b['y']);

$arg    =  ($a['x'] * $b['x'] + $a['y']*$b['y'])/ ($lenA * $lenB);

echo "ARG:" . $arg;

$radias  =   acos($arg);

$angle =   $radias * 180/pi(); // angle in degree

echo "the angle(degrees) beetween two Vector V1(". $a['x'].','.$a['y'].") - V2(". $b['x'].','.$b['y'].") is : ".angle($t2,$t1);

echo "<br> A and Axis: ". degreeAngle(angle_between($a,$axis));
echo "<br> B and Axis: ". degreeAngle(angle_between($b,$axis));


function degreeAngle($rad) {
    return  $rad * 180/pi();
}
//create a vector
function vector($x,$y) {
    return array('x' => $x, 'y' => $y);
}

function delta($a, $b) {
    return vector($a['x'] - $b['x'], $a['y'] - $b['y']);
}

//angle between two point in degrees
function angle($p1,$p2) {
    $xDiff = $p2['x'] - $p1['x'];
    
    $yDiff = $p2['y'] - $p1['y']; 
    
    $dangle =   atan2($yDiff, $xDiff) * (180 / pi());
    
    return $dangle; 
} 

//See more at: http://wikicode.wikidot.com/get-angle-of-line-between-two-points#sthash.Z4ovg23I.dpuf



function angle_between($a, $b) {
    return acos(($a['x'] * $b['x'] + $a['y'] * $b['y']) / (len($a) * len($b)));
}

function len($v) {
    return sqrt($v['x'] * $v['x'] + $v['y'] * $v['y']);
}

function get_direction($radias) {
    if ($radias < 1.5 * pi() && $radias > 0) {
        return 1;
    }
}

?>

    </body>
</html>