<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';
require_once '../../lib/qrcode.php';

// Validate POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        ApiResponse::notFound()->send();
    }

    // Check if creation is allowed based on user's tier
    $subscription = $db->selectOne("subscriptions", [
        "userId" => $userId, 
        "canceledAt" => null
    ]);
    if (!$subscription) {
        ApiResponse::forbidden('You are not subscribed to any plan')->send();
    }
    $userTier = $db->selectOne("tiers", ["id" => $subscription["tierId"]]);

    $qrCodesNum = $db->count("qrcodes", ["userId" => $userId]);

    if(!$userTier) {
        ApiResponse::notFound()->send();
    }

    if ($qrCodesNum["count"] >= $userTier["maxQRCodes"]) {
        ApiResponse::forbidden('You have reached the maximum number of QR codes for your plan')->send();
    }

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['qrType']) || empty(trim($input['qrType']))) {
        ApiResponse::clientError('Invalid input')->send();
    }

    // Validate name length
    if (isset($input['name']) && strlen(trim($input['name'])) > 20) {
        ApiResponse::clientError('Name must be less than 20 characters')->send();
    }

    // Route based on QR type
    $qrType = trim($input['qrType']);
    switch ($qrType) {
        case 'vCards':
            $qrCode = createVCardQR($userId, $input);
            break;
        case 'classics':
            $qrCode = createClassicQR($userId, $input);
            break;
        default:
            ApiResponse::clientError('Invalid QR code type')->send();
    }

    ApiResponse::created('QR code created successfully', $qrCode)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
