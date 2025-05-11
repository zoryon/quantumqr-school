<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== "GET") {
    ApiResponse::methodNotAllowed()->send();
}

try {
    $db = DB::getInstance();

    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        ApiResponse::notFound()->send();
    }

    if (isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
    }

    // Check if current session is admin
    $currentUser = $db->selectOne("active_users", [
        "id" => $userId, 
        "role" => UserRole::ADMIN->value
    ]);
    if ($currentUser === null) {
        ApiResponse::notFound()->send();
    }

    $users = $db->select('active_users', ["role" => UserRole::USER->value]);
    if ($users === null) {
        ApiResponse::internalServerError()->send();
    }

    ApiResponse::success('User list found successfully', $users)->send();
} catch(Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>