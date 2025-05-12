<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if (!$userId) ApiResponse::unauthorized('You are not logged in or your session has expired')->send(); 
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);
    // Validate input: ensure the 'id' of the QR code to delete is present
    if (!isset($input['id'])) ApiResponse::clientError('Missing QR code ID in request body')->send(); 

    // Cast the provided ID to an integer and validate it's a positive number
    $qrId = (int)$input['id'];
    if ($qrId <= 0) ApiResponse::clientError('Invalid QR code ID provided')->send();

    // Perform the deletion in the 'qr_codes' table
    $affectedRows = $db->delete("qr_codes", [
        "id" => $qrId,      // Delete the QR code with this ID
        "userId" => $userId // AND that belongs to the current user
    ]);

    // Check the number of rows affected by the delete operation
    if ($affectedRows === 0) {
        // If 0 rows were affected, the QR code was not found or did not belong to the user
        ApiResponse::notFound('QR code not found or you do not have permission to delete it')->send(); 
    } elseif ($affectedRows !== 1) {
        ApiResponse::internalServerError('Unexpected database behavior during deletion.')->send();
    }

    ApiResponse::success('QR code deleted successfully', $affectedRows)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError('An error occurred while deleting the QR code. Please try again.')->send(); 
}