<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Get and decode input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (!isset($input['id'])) ApiResponse::clientError('Missing QR code ID in request body')->send();

    // Validate QR code ID format
    $qrId = (int)$input['id'];
    if ($qrId <= 0) ApiResponse::clientError('Invalid QR code ID provided')->send();

    // Execute an SQL UPDATE query to increment the 'scans' column by 1
    $updateSql = "UPDATE qr_codes SET scans = scans + 1 WHERE id = ?";
    $stmt = $db->execute($updateSql, [$qrId]);

    // Check if the update statement successfully affected any rows
    // If rowCount is 0, no QR code with that ID was found to update
    if (!$stmt || $stmt->rowCount() === 0) ApiResponse::notFound('QR code not found or update failed')->send();

    // Fetch the QR code data again from the database to get the new scan count
    $updatedQrData = $db->selectOne("qr_codes", ["id" => $qrId]);

    if ($updatedQrData === null) ApiResponse::internalServerError('QR code data not found after scan update')->send();

    ApiResponse::success('Scan count updated successfully', [
        'scans' => (int)$updatedQrData['scans'] 
    ])->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}