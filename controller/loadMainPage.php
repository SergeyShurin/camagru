<?php

$carousel = file_get_contents("./templates/carousel.html");
$carousel2 = file_get_contents("./templates/carouselH.html");
$image = file_get_contents("./templates/carouselItem.html");
$page = file_get_contents("./templates/mainPage.html");


$images = scandir('./images/carousel/');
$content = "";
for ($i = 3; $i < count($images); $i++) {
    $content .= preg_replace('/({{path}})/', "./images/carousel/".$images[$i], $image);
}

$carousel = preg_replace('/({{images}})/', $content, $carousel);
$page =  preg_replace('/({{carousel}})/', $carousel, $page);
$page =  preg_replace('/({{carousel2}})/', $carousel2, $page);

echo $page;