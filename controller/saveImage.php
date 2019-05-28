<?php

$fileContent = file_get_contents($_FILES['afile']['tmp_name']);
file_put_contents('../images/image.png', $fileContent);