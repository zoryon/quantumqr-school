<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

if ($SERVER['REQUEST_METHOD'] !== "GET") {
    ApiResponse::methodNotAllowed()->send();
}

try {
    $db = DB::getInstance();

    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        ApiResponse::notFound()->send();
    }

    // Check if current session is admin
    $currentUser = $db->selectOne("users", [
        "id" => $userId, 
        "isEmailConfirmed" => true, 
        "isAdmin" => true
    ]);
    if (!$currentUser || empty($currentUser)) {
        ApiResponse::notFound()->send();
    }

    $users = $db->select('users');
    if (!$users) {
        ApiResponse::internalServerError()->send();
    }

    ApiResponse::success('User list found successfully', $users)->send();
} catch(Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>