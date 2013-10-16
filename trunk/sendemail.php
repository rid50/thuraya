<?php
$mailTo = $_POST['emailTo'];
$mailFrom = $_POST['emailFrom'];
$subject = $_POST['subject'];
$message = $_POST['message'];
mail($mailTo, $subject, $message, "From: ".$mailFrom);
?>