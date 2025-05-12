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

    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) ApiResponse::notFound()->send(); 

    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Check if the current session user has the ADMIN role
    $currentUser = $db->selectOne("active_users", [
        "id" => $userId,
        "role" => UserRole::ADMIN->value 
    ]);
    // If the user is not found or is not an admin, deny access
    if ($currentUser === null) {
        ApiResponse::notFound()->send(); 
    }

    // Select all users from the active_users table where the role is USER
    $users = $db->select('active_users', ["role" => UserRole::USER->value]);
    // Handle database query failure
    if ($users === null) ApiResponse::internalServerError()->send(); 

    ApiResponse::success('User list found successfully', $users)->send();
} catch(Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>