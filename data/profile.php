<?php

function forbidNotifications($id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(   
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "UPDATE users SET allow_notif = 'N'
                WHERE user_id = $id;"
            );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function allowNotifications($id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(   
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "UPDATE users SET allow_notif = 'Y'
                WHERE user_id = $id;"
            );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}
function changeUser($user_id, $name) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(   
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "UPDATE users SET username = '$name'
            WHERE user_id = $user_id"
        );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function changePass($user_id, $pass) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(   
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $hashPass = hash('ripemd160', $pass);
        $requete = $dbh->prepare(
            "UPDATE users SET password = '$hashPass'
            WHERE user_id = $user_id"
        );
$requete->execute();
            }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function changeMail($user_id, $mail) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(   
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "UPDATE users SET mail = '$mail'
            WHERE user_id = $user_id"
        );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}
