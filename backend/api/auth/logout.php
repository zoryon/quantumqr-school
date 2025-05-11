<?php

require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
};

try {
    $db = DB::getInstance();

    if (!isset($_COOKIE['session_token'])) {
        ApiResponse::unauthorized('You are not logged in')->send();
    }

    setcookie(
        'session_token', 
        '', 
        time() - 3600, 
        "/", 
        "", 
        false, 
        true
    );

    ApiResponse::success('Logged out successfully', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>