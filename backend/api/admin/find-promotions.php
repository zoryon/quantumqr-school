<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

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

    // Find confirmed user
    $user = $db->selectOne("users", [
        "id" => $userId, 
        "isAdmin" => true,
        "isEmailConfirmed" => true
    ]);

    if (!$user || empty($user)) {
        ApiResponse::notFound('User not found')->send();
    }

    $promotionRequests = $db->select("promotionrequests", [ "reviewedAt" => null ]);
    if ($promotionRequests == null) {
        $promotionRequests = [];
    } elseif ($promotionRequests === false) {
        ApiResponse::internalServerError()->send();
    }

    ApiResponse::success('Promotion requests found successfully', $promotionRequests)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}