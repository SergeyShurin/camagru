<?php

function addLike($img_id, $user_id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(    
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $user_id = $_SESSION["id"];
        $requete = $dbh->prepare(
            "INSERT INTO likes (img_id, user_id)
            VALUES ($img_id, $user_id);"
        );
        $requete->execute();
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}

function getAllImgLikes($img_id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT COUNT(*) AS `all` FROM likes
                WHERE img_id = $img_id");
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}


function getUserImgLike($img_id, $user_id) {
    require "./config/database.php";

    try {
        $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ));
        $requete = $dbh->prepare(
            "SELECT * FROM likes l
                INNER JOIN images i
                ON  i.img_id = l.img_id
                WHERE l.img_id = $img_id &&
                l.user_id = $user_id &&
                i.is_delete = 0"
            );
        $requete->execute();
        $code = $requete->fetchAll(PDO::FETCH_ASSOC);
        return $code;
    }
    catch (PDOException $e) {
        $_SESSION['error'] = "ERROR: ".$e->getMessage();
    }
}
