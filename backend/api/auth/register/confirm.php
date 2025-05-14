<?php

require_once __DIR__ . '/../../../bootstrap.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') ApiResponse::methodNotAllowed()->send();

// Get the 'token' from the query parameters
$token = $_GET['token'] ?? null; 

// If no token is provided, return an unauthorized error
if (!$token) ApiResponse::unauthorized('Missing token ')->send(); 

$db = DB::getInstance();

// Define the JWT secret key used for signing the email confirmation token
$MAILER_SECRET = '0f98a88ce3ca074d1db8b8fe7d1f77e3c3153b5a667a5d105194511daced5392'; 

try {
    // Decode and validate the JWT token using the secret key and HS256 algorithm
    $decoded = JWT::decode($token, new Key($MAILER_SECRET, 'HS256'));

    // Extract the 'userId' from the decoded token payload
    $userId = $decoded->userId ?? null;

    // If 'userId' is not present in the token payload, the token is invalid
    if (!$userId) throw new Exception('Invalid token payload: User ID missing');

    // Update the user's status to confirmed in the 'users' table
    $res = $db->update("users", ["isEmailConfirmed" => 1], [
        "id" => $userId,
        "isEmailConfirmed" => 0 // Ensuring confirming only unconfirmed emails
    ]);

    // Check if the user was successfully updated (exactly one row affected)
    if ($res === 0) {
        // If 0 rows were affected, the user might not exist or was already confirmed
        ApiResponse::notFound('User not found or email already confirmed')->send();
    }

    // If email confirmation was successful, create a free subscription for the user
    $res = $db->insert("subscriptions", [
        "userId" => $userId,
        "tierId" => 1 // (Assuming) 1 is the ID for the free subscription tier
    ]);

    // Check if the subscription was successfully created
    if (!$res) ApiResponse::internalServerError('Failed to create subscription after email confirmation')->send();

    ApiResponse::success('Email confirmed successfully', true)->send();
} catch (ExpiredException $e) {
    ApiResponse::unauthorized('Token expired')->send();
} catch (SignatureInvalidException $e) {
    ApiResponse::unauthorized('Invalid token signature')->send();
} catch (Exception $e) {
    ApiResponse::unauthorized('Invalid token or an error occurred')->send();
}