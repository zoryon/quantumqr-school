<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
        ApiResponse::forbidden("You are under a ban currently")->send();
    }

    // Find confirmed user
    $user = $db->selectOne("active_users", ["id" => $userId]);

    if (!$user || empty($user)) {
        ApiResponse::notFound()->send();
    }

    if ($user["role"] === UserRole::ADMIN->value) {
        ApiResponse::clientError('Already an admin')->send();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input["requestReason"] || empty($input["requestReason"])) {
        ApiResponse::clientError('Wrong inserted data')->send();
    }

    $existing = $db->selectOne("promotion_requests", ["userId" => $userId]);

    if ($existing) {
        ApiResponse::conflict('You have already sent a promotion request')->send();
    }
    
    $newId = $db->insert("promotion_requests", [
        "userId" => $userId,
        "requestReason" => $input["requestReason"],
    ]);

    if (!$newId) {
        ApiResponse::internalServerError()->send();
    }

    ApiResponse::success('Request sent successfully', $newId)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}