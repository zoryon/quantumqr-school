<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php'; 
require_once '../../lib/qrcode.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if (!$userId) ApiResponse::unauthorized('Invalid session or not logged in')->send(); 

    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Check if the user has an active subscription
    $subscription = $db->selectOne("subscriptions", [
        "userId" => $userId,
        "canceledAt" => null // Look for subscriptions that are not canceled
    ]);
    // If no active subscription is found, the user cannot create QR codes
    if (!$subscription) ApiResponse::forbidden('You are not subscribed to any plan that allows QR code creation')->send(); 

    // Get the tier details associated with the user's active subscription
    $userTier = $db->selectOne("tiers", ["id" => $subscription["tierId"]]);
    if(!$userTier) ApiResponse::internalServerError('Could not retrieve user tier information')->send(); 

    // Count the number of QR codes the user already owns
    $qrCodesNum = $db->count("qr_codes", ["userId" => $userId]);

    // Check if the user has reached the maximum number of QR codes allowed by their tier
    if ($qrCodesNum >= $userTier["maxQRCodes"]) ApiResponse::forbidden('You have reached the maximum number of QR codes allowed for your plan. Please upgrade or delete existing QR codes.')->send(); 

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Check if 'qrType' is set and not empty
    if (!isset($input['qrType']) || empty(trim($input['qrType']))) ApiResponse::clientError('Invalid input: QR type is required')->send();

    // Validate 'name' field length if present
    if (isset($input['name']) && strlen(trim($input['name'])) > 20) ApiResponse::clientError('Name must be less than 20 characters')->send();

    // Route the QR code creation process based on the 'qrType'
    $qrType = trim($input['qrType']);
    $qrCode = null; 

    switch (strtolower($qrType)) { // Case-insensitive comparison
        case 'vcards':
            $qrCode = createVCardQR($userId, $input);
            break;
        case 'classics':
            $qrCode = createClassicQR($userId, $input);
            break;
        default:
            ApiResponse::clientError('Invalid QR code type specified')->send();
            break; 
    }

    if ($qrCode === null) ApiResponse::internalServerError('QR code creation failed unexpectedly.')->send();

    ApiResponse::created('QR code created successfully', $qrCode)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError('An error occurred while creating the QR code. Please try again.')->send(); 
}