<?php

require_once "./data/images.php";

if (isset($_POST["img"])) {
    $data = $_POST["img"];
    list($type, $data) = explode(';', $data);
    list(, $data)      = explode(',', $data);
    $img = base64_decode($data);
    file_put_contents('./images/image.png', $img);
}
    
$data2 = $_POST["img2"];

$img1 = imagecreatefrompng("./images/image.png");
$img2 = imagecreatefrompng($data2);

$ratio = imagesy($img2) / imagesx($img2);

$imgWidth = 204 * $_POST["scope"];
$new_image = imagecreatetruecolor($imgWidth, $ratio * $imgWidth);
$background = imagecolorallocate($new_image , 0, 0, 0);
imagecolortransparent($new_image, $background);
imagecopyresampled($new_image, $img2, 0, 0, 0, 0, $imgWidth, $ratio * $imgWidth, imagesx($img2), imagesy($img2));

imagecopy ($img1, $new_image,
    imagesx($img1) * $_POST["x"] , imagesy($img1) * $_POST["y"] ,
    0 , 0 ,
    imagesx($new_image) , imagesy($new_image) );

if (isset($_SESSION["id"])) {
    $imgCount = addImage($_SESSION["id"])[0]["img_id"];
    imagepng($img1, "./images/image$imgCount.png");
    print_r ($imgCount);
}

