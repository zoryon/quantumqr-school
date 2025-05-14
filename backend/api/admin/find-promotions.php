<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') ApiResponse::methodNotAllowed()->send();

try {
    $db = DB::getInstance();

    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) ApiResponse::notFound()->send(); 

    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Find the user by ID and confirm they have the ADMIN role
    $user = $db->selectOne("active_users", [
        "id" => $userId,
        "role" => UserRole::ADMIN->value, 
    ]);

    if (!$user || empty($user)) ApiResponse::notFound('User not found or not authorized')->send(); 

    // Select all promotion requests that have not been reviewed yet (reviewedAt is null)
    $promotionRequests = $db->select("promotion_requests", [ "reviewedAt" => null ]);
    // Handle database query failure
    if ($promotionRequests === null) ApiResponse::internalServerError()->send(); 

    ApiResponse::success('Promotion requests found successfully', $promotionRequests)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}