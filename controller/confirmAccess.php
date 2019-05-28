<?php

require_once "./data/user.php";
require_once "./controller/functions.php";

unset($_SESSION["error"]);

function sentAuthMail($to, $subject, $message) {
    $to  = "<$to>" ; 
    $headers  = "Content-type: text/html; charset=windows-1251\r\n"; 
    $headers .= "From: От кого письмо <admin@camagru.kek>\r\n"; 
    $headers .= "Reply-To: admin@camagru.kek\r\n"; 
    mail($to, $subject, $message, $headers); 
}

function checkVerification($user) {
    if ($user[0]["verified"] === "N") {
        if (!isset($_SESSION["key"])) {
            $key = RandomString();
            $_SESSION["key"] = $key;
            sentAuthMail($user[0]["mail"], "autification key", "Your key: $key");
            echo json_encode(["status" => "key", "key" => $_SESSION["key"]]);
        }
        else if (isset($_SESSION["key"]) && !isset($_GET["key"])) {
            echo json_encode(["status" => "key", "key" => $_SESSION["key"]]);
        }
        else {
            if ($_GET["key"] === $_SESSION["key"]) {
                makeUserVirified($user[0]["user_id"]);
                return 1;
            }
            else {
                echo json_encode(["status" => "key is wrong"]);
            }
        }
    }
    else {
        return 1;
    }
}

if (isset($_GET["submit"])) {
    $login = $_GET["text"];
    $pass = $_GET["password"];
    if (isset($_GET["email"])) $mail = $_GET["email"];
    $user = getUser($login, $pass);
    if (isset($_SESSION["error"])) {
        echo json_encode(["status" => "error is ocured"]);
        return 1;
    };
    if ($_GET["submit"] === "Login") {
        if ($user) {
            if (checkVerification($user)) {
                if ($user[0]["password"] === hash('ripemd160', $pass)) {
                    $_SESSION["id"] = $user[0]["user_id"];
                    unset($_SESSION["key"]);
                    echo json_encode(["status" => "exist"]);
                }
                else {
                    echo json_encode(["status" => "wrong login or password"]);
                }
            };
        }
        else {
            echo json_encode(["status" => "wrong login or password"]);
        }
    }
    else if ($_GET["submit"] === "Registration") {
        if ($user) {
            if (isset($_GET["key"])) {
                if (checkVerification($user)) {
                    $_SESSION["id"] = $user[0]["user_id"];
                    unset($_SESSION["key"]);
                    echo json_encode(["status" => "exist"]);
                }
                else {
                    echo json_encode(["status" => "wrong login or password"]);
                }
            }
            else {
                echo json_encode(["status" => "user already exist"]);
            }
        }
        else {
            addUser($login, $pass, $mail);
            $user = getUser($login, $pass);
            if (checkVerification($user)) {
                $_SESSION["id"] = $user[0]["user_id"];
                echo json_encode(["status" => "exist"]);
            }
        }
    }
}
else if ($_GET["logout"]) {
    session_unset();
}
