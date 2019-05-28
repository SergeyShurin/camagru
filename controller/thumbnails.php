<?php

require_once "./data/images.php";

if (isset($_SESSION["id"])) {
    if (isset($_GET["delete"])) {
        if (!empty(userHaveImg($_SESSION["id"], $_GET["delete"]))) {
            deleteById($_GET["delete"]);
            echo ("delete");
        };
    }
    else {
        $ret = [];
        $data = getImagesById($_SESSION["id"]);
        foreach($data as $img) {
            if (!$img["is_delete"]) {
                $image = [];
                $image["path"] = "./images/image".$img["img_id"].".png";
                $image["id"] = $img["img_id"];
                $ret[] = $image;
            }
        }
        echo json_encode($ret);
    }
}
