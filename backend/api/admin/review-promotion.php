<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle GET request
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

    // Find confirmed user
    $user = $db->selectOne("users", [
        "id" => $userId, 
        "role" => UserRole::ADMIN,
        "isEmailConfirmed" => true
    ]);

    if (!$user || empty($user)) {
        ApiResponse::notFound()->send();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input["userId"]) || empty($input["userId"])) {
        ApiResponse::clientError('Wrong data was passed')->send();
    }

    $affectedRows = $db->update("promotion_requests", $input, ["userId" => $input["userId"]]);

    if ($affectedRows !== 1) {
        ApiResponse::clientError('Wrong data was passed')->send();
    }

    if (!empty($input["acceptedAt"]) && $input["acceptedAt"] !== null) {
        $affectedRows = $db->update("users", ["role" => UserRole::ADMIN], [
            "id" => $input["userId"],
            "isEmailConfirmed" => true
        ]);

        if ($affectedRows !== 1) {
            ApiResponse::internalServerError()->send();
        }
    } 

    ApiResponse::success('Promotion successfully reviewed', $affectedRows)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}