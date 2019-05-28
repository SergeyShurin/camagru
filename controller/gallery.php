<?php

require_once "./data/images.php";
require_once "./data/likes.php";
require_once "./data/comments.php";

$ret = [];
if (isset($_GET["start"]) && isset($_GET["count"])) {
    $data = getImages($_GET["start"], $_GET["count"]);
    foreach($data as $img) {
        $obj = [];
        $obj["id"] = $img["img_id"];
        $obj["img"] = "./images/image".$img["img_id"].".png";
        $obj["likes"] = getAllImgLikes($img["img_id"])[0]["all"];
        $obj["comments"] = count(getAllImgComments($img["img_id"]));
        if (isset($_SESSION["id"])) {
            $isLiked = getUserImgLike($img["img_id"], $_SESSION["id"]);
            if ($isLiked) {
                $obj["like"] = "set";    
            }
        }
        $ret[] = $obj;
    }
    echo json_encode($ret);
}
else if (isset($_GET["all"])) {
    echo (getAllImages()[0]["all"]);
}
else if (isset($_GET["addLike"])) {
    if (isset($_SESSION["id"])) {
        if (empty(imgIsDelete($_GET["addLike"])) &&
            empty(getUserImgLike($_GET["addLike"], $_SESSION["id"]))) {
            addLike($_GET["addLike"], $_SESSION["id"]);
            echo "add";
        }
    }
}
