<?php

require_once '../../db/DB.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Gestione della richiesta POST
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