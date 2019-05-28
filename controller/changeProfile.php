<?php

require_once "./data/profile.php";
require_once "./data/user.php";

if (isset($_GET["user"])) {
    changeUser($_SESSION["id"], $_GET["user"]);
    echo "username changed";
}
else if (isset($_GET["pass"])) {
    changePass($_SESSION["id"], $_GET["pass"]);
    echo "password changed";
}
else if (isset($_GET["mail"])) {
    changeMail($_SESSION["id"], $_GET["mail"]);
    echo "mail changed";
}
else if (isset($_GET["allow"])) {
    allowNotifications($_SESSION["id"]);
    echo "Yoy will be receive notifications about comments";
}
else if (isset($_GET["forbid"])) {
    forbidNotifications($_SESSION["id"]);
    echo "Yoy won't be receive notifications about comments";
}
else if (isset($_GET["getuser"])) {
    $user = getUserById($_SESSION["id"]);
    echo json_encode($user);
}
