<?php

require_once "./controller/functions.php";
require_once "./controller/router.php";

session_start();

if (empty($_GET) && empty($_POST)) {
    session_unset();
}
if (isset($_COOKIE["token"]) && isset($_SESSION["secret"])) {
    // $token = $_COOKIE["token"];
    $arr = getallheaders();
    if (isset($arr["X-CSRF-TOKEN"])) {
        $token = urldecode(htmlentities($arr["X-CSRF-TOKEN"]));
        // echo "$token";
        // echo "<br>\n";
        $salt = explode(":", $token)[0];
        // $salt = explode("=", $salt)[1];
        $secret = $_SESSION["secret"];
        // echo "$salt";
        // echo "<br>\n";
        if ($token !== "$salt:".hash('ripemd160', "$salt:$secret")) {
            echo "$salt";
            echo "<br>\n";
            echo "$token";
            echo "<br>\n";
            echo "$salt:".hash('ripemd160', "$salt:$secret");
            // header('HTTP/1.0 403 Forbidden');
        }
        else if (!empty($_GET) || !empty($_POST)) {
            route();
        }
        // else {
        //     echo file_get_contents("./templates/index.html");
        // }
    }
    else {
        echo "lol";
        // header('HTTP/1.0 403 Forbidden');
    }
}
else {
    $secret = RandomString();
    $salt = RandomString();
    $_SESSION["secret"] = $secret;
    $token = "$salt:".hash('ripemd160', "$salt:$secret");
    setcookie("token", $token);
    echo file_get_contents("./templates/index.html");
}