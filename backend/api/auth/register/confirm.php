<?php
require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $db->setStatus(405)
        ->setResponse([
            'success' => false,
            'message' => 'Method not allowed',
            'body' => null
        ])
        ->send();
}

// Get token from query parameters
$token = $_GET['token'] ?? null;

if (!$token) {
    $db->setStatus(401)
        ->setResponse([
            'success' => false,
            'message' => 'Invalid token.',
            'body' => null
        ])
        ->send();
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
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found',
                'body' => null
            ])
            ->send();
    }

    // Create free subscription for the user
    $res = $db->insert("subscriptions", [
        "userId" => $userId, 
        "tierId" => 1
    ]);

    if (!$res) {
        $db->setStatus(500)
            ->setResponse([
                'success' => false,
                'message' => 'Failed to create subscription',
                'body' => null
            ])
            ->send();
    }

    // Success response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Email confirmed successfully',
            'body' => null
        ])
        ->send();
} catch (ExpiredException $e) {
    $db->setStatus(401)
        ->setResponse([
            'success' => false,
            'message' => 'Token expired',
            'body' => null
        ])
        ->send();
} catch (SignatureInvalidException $e) {
    $db->setStatus(401)
        ->setResponse([
            'success' => false,
            'message' => 'Invalid token signature',
            'body' => null
        ])
        ->send();
} catch (Exception $e) {
    $db->setStatus(401)
        ->setResponse([
            'success' => false,
            'message' => 'Invalid token',
            'body' => null
        ])
        ->send();
}