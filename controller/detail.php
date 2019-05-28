<?php

require_once "./data/comments.php";
require_once "./data/images.php";
require_once "./data/user.php";

function sentNotificationMail($to, $subject, $message) {
    $to  = "<$to>" ; 
    $headers  = "Content-type: text/html; charset=windows-1251\r\n"; 
    $headers .= "From: От кого письмо <admin@camagru.kek>\r\n"; 
    $headers .= "Reply-To: reply-to@example.com\r\n"; 
    mail($to, $subject, $message, $headers); 
}

function sentNotification($img_id, $text) {
    $user = getUserByImageId($img_id);
    if ($user[0]["allow_notif"] === "Y") {
        sentNotificationMail($user[0]["mail"], "Notification", "Someone comment your photo: $text");
    };
} 

if (isset($_GET["comments"])) {
    echo json_encode(getAllImgComments($_GET["comments"]));
}
else if (isset($_GET["next"])) {
    echo json_encode(getNextImage($_GET["next"]));
}
else if (isset($_GET["prev"])) {
    echo json_encode(getPrevImage($_GET["prev"]));
}
else if (isset($_GET["sent"]) && isset($_GET["text"])) {
    if (isset($_SESSION["id"])) {
        addComment($_GET["sent"], $_SESSION["id"], $_GET["text"]);
        $user = getUsernameById($_SESSION["id"])[0];
        sentNotification($_GET["sent"], $_GET["text"]);
        echo ($user["username"]);
    }
    else {
        echo "forbid";
    }
}
else {
    echo file_get_contents("./templates/detail.html");
}
