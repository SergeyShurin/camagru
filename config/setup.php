<?php

require_once "database.php";

$options = array(
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
); 

try {
    $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, $options);
    $sql = "DROP TABLE likes";
    $dbh->exec($sql);
    $sql = "DROP TABLE coments";
    $dbh->exec($sql);
    $sql = "DROP TABLE images";
    $dbh->exec($sql);
    $sql = "DROP TABLE users";
    $dbh->exec($sql);
    $sql = "CREATE TABLE users (
          `user_id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
          `username` VARCHAR(50) NOT NULL,
          `mail` VARCHAR(100) NOT NULL,
          `password` VARCHAR(255) NOT NULL,
          `verified` VARCHAR(1) NOT NULL DEFAULT 'N',
          `allow_notif` VARCHAR(1) NOT NULL DEFAULT 'Y'
        )";
    $dbh->exec($sql);

    
    $sql = "CREATE TABLE images (
            user_id INT NOT NULL,
            `img_id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            `is_delete` TINYINT(1) NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )";
    $dbh->exec($sql);
    
    $sql = "CREATE TABLE coments (
        `img_id` INT NOT NULL,
        `user_id` INT NOT NULL,
        `com_id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        FOREIGN KEY (img_id) REFERENCES images(img_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        `text` VARCHAR(255) NOT NULL
    );";
    $dbh->exec($sql);
    
    $sql = "CREATE TABLE likes (
            img_id INT NOT NULL,
            user_id INT NOT NULL,
            `like_id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            FOREIGN KEY (img_id) REFERENCES images(img_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );";
    $dbh->exec($sql);
    
    $pass1 = hash('ripemd160', 12);
    $pass2 = hash('ripemd160', 123);
    $sql = "INSERT INTO users (`username`, `mail`, `password`)
            VALUES ('mskiles', 'reinoldskora@gmail.com', '$pass1')";
    $dbh->exec($sql);
    $sql = "INSERT INTO images (`user_id`)
            VALUES (1)";
    $dbh->exec($sql);
    
    $requete = $dbh->prepare("SELECT * FROM users WHERE username = 'mskiles2'");
    $requete->execute();
    $code = $requete->fetchAll(PDO::FETCH_ASSOC);
    echo "Database created successfully\n";
} catch (PDOException $e) {
    echo "ERROR CREATING DB: \n".$e->getMessage()."\nAborting process\n";
    exit(-1);
}