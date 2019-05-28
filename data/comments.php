<?php

function addComment($img_id, $user_id, $text) {
    require "./config/database.php";

    $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ));
    $user_id = $_SESSION["id"];
    $requete = $dbh->prepare(
        "INSERT INTO coments (img_id, user_id, text)
        VALUES ($img_id, $user_id, '$text')"
    );
    $requete->execute();
}

function getAllImgComments($img_id) {
    require "./config/database.php";

    $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ));
    $requete = $dbh->prepare(
        "SELECT username, text
            FROM coments c
            INNER JOIN users u
            ON u.user_id = c.user_id
            WHERE img_id = $img_id
        ORDER BY c.com_id;"
        );
    $requete->execute();
    $code = $requete->fetchAll(PDO::FETCH_ASSOC);
    return $code;
}
