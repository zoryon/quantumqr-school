<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

// Handle DELETE request
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Validate session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        ApiResponse::unauthorized('You are not logged in')->send();
    }
    
    if (isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
    }

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id'])) {
        ApiResponse::clientError('Missing QR code ID')->send();
    }

    $qrId = (int)$input['id'];
    if ($qrId <= 0) {
        ApiResponse::clientError('Invalid QR code ID')->send();
    }

    // Perform deletion
    $affectedRows = $db->delete("qr_codes", [
        "id" => $qrId, 
        "userId" => $userId
    ]);

    if ($affectedRows === 0) {
        ApiResponse::notFound('QR code not found')->send();
    }

    // Return deleted QR code data
    ApiResponse::success('QR code deleted', $affectedRows)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}