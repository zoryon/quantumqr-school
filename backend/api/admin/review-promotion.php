<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

try {
    $db = DB::getInstance();

    // Check for an existing session and get the user ID of the admin
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId)  ApiResponse::notFound()->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Find the session user and verify they have the ADMIN role
    $user = $db->selectOne("active_users", [
        "id" => $userId,
        "role" => UserRole::ADMIN->value, 
    ]);

    if (!$user || empty($user)) ApiResponse::notFound()->send();

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (!isset($input["userId"]) || empty($input["userId"])) ApiResponse::clientError('Wrong data was passed')->send();

    // Add the admin's ID as the reviewer
    $input["reviewerAdminId"] = $userId;

    // Update the promotion_requests table with the review outcome (acceptedAt, rejectedAt, reviewerAdminId)
    $affectedRows = $db->update("promotion_requests", $input, ["userId" => $input["userId"]]);

    // Check if exactly one row in promotion_requests was updated
    if ($affectedRows !== 1) ApiResponse::clientError('Wrong data was passed or request not found')->send(); 

    // If the request was accepted (acceptedAt is set and not null)
    if (!empty($input["acceptedAt"]) && $input["acceptedAt"] !== null) {
        // Update the user's role to ADMIN in the users table
        $affectedRows = $db->update("users", ["role" => UserRole::ADMIN->value], [
            "id" => $input["userId"],
            "isEmailConfirmed" => true // Only promote confirmed users
        ]);

        // Check if exactly one row in users was updated (the user was found and updated)
        if ($affectedRows !== 1) {
            // the promotion request was marked as accepted, but the user's role wasn't updated
            ApiResponse::internalServerError('Failed to update user role after accepting request')->send();
        }
    }

    ApiResponse::success('Promotion successfully reviewed', $affectedRows)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}