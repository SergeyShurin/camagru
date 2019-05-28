<?php

function userHaveImg($user_id, $img_id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM users u
                INNER JOIN images i
                ON u.user_id = i.user_id
                WHERE i.img_id=$img_id &&
                u.user_id = $user_id"
            );
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function imgIsDelete($img_id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM images
                WHERE img_id=$img_id &&
                is_delete = 1"
            );
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function deleteById($img_id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "UPDATE images
                SET is_delete=1
                WHERE img_id=$img_id"
            );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getAllImages() {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT COUNT(*) AS `all` FROM images
                WHERE is_delete = 0");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getImages($start, $count) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
        "SELECT * FROM (
            SELECT row_number() OVER() AS num, img_id
            FROM images
                WHERE is_delete = 0
                ORDER BY img_id DESC
                )a
            WHERE a.num > $start
            LIMIT $count");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getPrevImage($imgId) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM images
                WHERE img_id < $imgId && is_delete = 0
                ORDER BY img_id DESC
                LIMIT 1
            ");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getNextImage($imgId) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM images
                WHERE img_id > $imgId && is_delete = 0
                LIMIT 1
            ");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getImagesById($userId) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM images
            WHERE user_id = $userId
            ORDER BY img_id DESC");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function imageCount() {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare("SELECT COUNT(*) AS count FROM images");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function addImage($userId) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "INSERT INTO images (user_id)
                VALUES ($userId)"
            );
        $requete->execute();
        $requete = $dbh->prepare("SELECT * FROM images ORDER BY img_id DESC LIMIT 1");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}