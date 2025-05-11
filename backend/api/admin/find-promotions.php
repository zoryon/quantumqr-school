<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

    // Find confirmed user
    $user = $db->selectOne("active_users", [
        "id" => $userId, 
        "role" => UserRole::ADMIN->value,
    ]);

    if (!$user || empty($user)) {
        ApiResponse::notFound('User not found')->send();
    }

    $promotionRequests = $db->select("promotion_requests", [ "reviewedAt" => null ]);
    if ($promotionRequests === null) {
        ApiResponse::internalServerError()->send();
    } 

    ApiResponse::success('Promotion requests found successfully', $promotionRequests)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}