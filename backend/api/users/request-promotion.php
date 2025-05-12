<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') ApiResponse::methodNotAllowed()->send();

try {
    $db = DB::getInstance();

    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if (!$userId) ApiResponse::unauthorized('You are not logged in or your session has expired')->send(); 
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Find the user's details from active_users (ensures user is not banned and exists)
    $user = $db->selectOne("active_users", ["id" => $userId]);

    // If user not found in active_users (should be caught by session check, but good practice)
    if ($user === null || empty($user)) ApiResponse::notFound('User not found')->send();

    // Check if the user is already an admin
    if ($user["role"] === UserRole::ADMIN->value) ApiResponse::clientError('You are already an admin')->send();

    // Get and decode input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Ensure 'requestReason' is provided and not empty
    if (!isset($input["requestReason"]) || empty(trim($input["requestReason"]))) ApiResponse::clientError('Request reason is required')->send(); 

    // Check if the user has already sent a promotion request
    $existing = $db->selectOne("promotion_requests", ["userId" => $userId]);

    // If an existing request is found, prevent submitting another one
    if ($existing) ApiResponse::conflict('You have already sent a promotion request')->send();

    // Insert the new promotion request into the 'promotion_requests' table
    $newId = $db->insert("promotion_requests", [
        "userId" => $userId,                                // The user requesting promotion
        "requestReason" => trim($input["requestReason"]),   // The reason provided by the user
    ]);

    // Check if the database insertion was successful (insert returns the new ID)
    if (!$newId) ApiResponse::internalServerError('Failed to submit promotion request')->send();

    ApiResponse::success('Promotion request sent successfully', ['requestId' => $newId])->send(); 
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}