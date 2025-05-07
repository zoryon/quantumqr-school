<?php
require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../db/ApiResponse.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

// Get token from query parameters
$token = $_GET['token'] ?? null;

if (!$token) {
    ApiResponse::unauthorized('Invalid token')->send();
}

$db = DB::getInstance();

try {
    // Decode and validate JWT
    $decoded = JWT::decode($token, new Key('0f98a88ce3ca074d1db8b8fe7d1f77e3c3153b5a667a5d105194511daced5392', 'HS256'));
    $userId = $decoded->userId ?? null;

    if (!$userId) {
        throw new Exception('Invalid token payload');
    }

    // Update email confirmation status
    $res = $db->update("users", ["isEmailConfirmed" => 1], [
        "id" => $userId, 
        "isEmailConfirmed" => 0
    ]);

    // Check if user was updated
    if (!$res) {
        ApiResponse::notFound('User not found')->send();
    }

    // Create free subscription for the user
    $res = $db->insert("subscriptions", [
        "userId" => $userId, 
        "tierId" => 1
    ]);

    if (!$res) {
        ApiResponse::internalServerError('Failed to create subscription')->send();
    }

    ApiResponse::success('Email confirmed successfully', true)->send();
} catch (ExpiredException $e) {
    ApiResponse::unauthorized('Token expired')->send();
} catch (SignatureInvalidException $e) {
    ApiResponse::unauthorized('Invalid token signature')->send();
} catch (Exception $e) {
    ApiResponse::unauthorized('Invalid token')->send();
}