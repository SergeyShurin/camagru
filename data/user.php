<?php

function getUserByImageId($img_id) {
    include "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM images i
                INNER JOIN users u
                ON i.user_id = u.user_id
                WHERE i.img_id = $img_id"
        );
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function makeUserVirified($id) {
    include "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(    
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "UPDATE users SET verified = 'Y'
                WHERE user_id = $id;"
            );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getUserById($id) {
    include "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(    
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare("SELECT username, mail, allow_notif FROM users WHERE user_id = $id");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getUsernameById($id) {
    include "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(    
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare("SELECT username FROM users WHERE user_id = $id");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getUser($login, $pass) {
    include "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(    
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare("SELECT * FROM users WHERE username = '$login'");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function addUser($login, $pass, $mail) {
    include "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(    
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $hashPass = hash('ripemd160', $pass);
        $requete = $dbh->prepare(
            "INSERT INTO users (`username`, `mail`, `password`)
                VALUES ('$login', '$mail', '$hashPass')"
            );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }

}