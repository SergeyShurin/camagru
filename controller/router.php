<?php

function route() {
    $arr = (!empty($_GET)) ? $_GET : $_POST;
    // print_r($arr);
    if (isset($arr["load"])) {
        if ($arr["load"] === "profile") {
            include_once "./controller/loadProfilePage.php";
        }
        else if ($arr["load"] === "gallery") {
            include_once "./controller/loadGalleryPage.php";
        }
        else if ($arr["load"] === "main") {
            include_once "./controller/loadMainPage.php";
        }
    }
    else if (isset($arr["page"]) && $arr["page"] === "form") {
        if (isset($arr["getform"])) {
            include_once $arr["getform"];
        }
        else if (isset($arr["sendform"])) {
            include_once "./controller/confirmAccess.php";
        }
    }
    else if (isset($arr["page"]) && $arr["page"] === "profile") {
        include_once "./controller/changeProfile.php";
    }
    else if (isset($arr["page"]) && $arr["page"] === "thumbnails") {
        include_once "./controller/thumbnails.php";
    }
    else if (isset($arr["page"]) && $arr["page"] === "superposeImages") {
        include_once "./controller/superposeImages.php";
    }
    else if (isset($arr["page"]) && $arr["page"] === "afile") {
        include_once "./controller/saveImage.php";
    }
    else if (isset($arr["page"]) && $arr["page"] === "gallery") {
        include_once "./controller/gallery.php";
    }
    else if (isset($arr["page"]) && $arr["page"] === "detail") {
        include_once "./controller/detail.php";
    }
    
    // print_r($arr);
}