<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

// Define type mapping with validation rules
const TYPE_MAPPING = [
    'vCards' => [
        'table' => 'vcardqrcodes',
        'fields' => ['firstName', 'lastName', 'phoneNumber', 'email', 'address', 'websiteUrl'],
        'validation' => [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
        ]
    ],
    'classics' => [
        'table' => 'classicqrcodes',
        'fields' => ['targetUrl'],
        'validation' => [
            'targetUrl' => 'required|url|max:255'
        ]
    ]
];

$db = DB::getInstance();

try {
    // Validate session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        ApiResponse::unauthorized()->send();
    }

    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'], $input['type'])) {
        ApiResponse::clientError('Invalid request data')->send();
    }

    $qrId = (int)$input['id'];
    $type = $input['type'];

    // Validate type
    if (!array_key_exists($type, TYPE_MAPPING)) {
        ApiResponse::clientError('Invalid QR code type')->send();
    }

    $typeConfig = TYPE_MAPPING[$type];
    $data = $input;
    unset($data['id'], $data['type']);

    // Validate data
    $validationErrors = validateData($data, $typeConfig['validation']);
    if (!empty($validationErrors)) {
        ApiResponse::clientError('Validation failed', $validationErrors)->send();
    }

    // Check for duplicate name (excluding current QR)
    $stmt = $db->execute(
        "SELECT id FROM qrcodes WHERE userId = ? AND name = ? AND id != ?",
        [$userId, $data['name'], $qrId]
    );
    $existing = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($existing)) {
        ApiResponse::clientError('A QR Code with the same name already exists')->send();
    }

    /// --- Database Update (Transaction) ---
    $db->execute("START TRANSACTION");

    try {
        // 1. Update main qrcodes table (only name and updatedAt for now)
        $updateBaseSql = "UPDATE qrcodes SET name = ?, updatedAt = NOW() WHERE id = ? AND userId = ?";
        $updateBaseStmt = $db->execute($updateBaseSql, [trim($input['name']), $qrId, $userId]);

        // Check if the base update failed unexpectedly (e.g., DB error)
        if (!$updateBaseStmt) {
            throw new Exception("Failed to execute base QR code update for ID: $qrId");
        }

        // 2. Update type-specific table
        $specificTableName = $typeConfig['table'];
        $specificFields = $typeConfig['fields'];
        $setParts = [];
        $params = [];
        
        foreach ($specificFields as $field) {
            // Check if the field was provided in the input data
            if (array_key_exists($field, $input)) {
                // Use backticks for safety
                $setParts[] = "`$field` = ?";
                // Trim string inputs, handle other types if necessary
                $params[] = is_string($input[$field]) ? trim($input[$field]) : $input[$field];
            }
        }

        // Only run the update if there are specific fields to update
        if (!empty($setParts)) {
            $params[] = $qrId; // Add qrId for the WHERE clause
            $updateSpecificSql = "UPDATE `$specificTableName` SET " . implode(', ', $setParts) . " WHERE qrCodeId = ?";
            $updateSpecificStmt = $db->execute($updateSpecificSql, $params);

            if (!$updateSpecificStmt) {
                throw new Exception("Failed to execute specific QR code update for type '{$type}', ID: $qrId");
            }
        } 
        
        $db->execute("COMMIT");
    } catch (Exception $e) {
        $db->execute("ROLLBACK");
        throw $e;
    }

    // Get updated QR code
    $stmt = $db->execute(
        "SELECT q.*, t.* FROM qrcodes q
         LEFT JOIN {$typeConfig['table']} t ON q.id = t.qrCodeId
         WHERE q.id = ?",
        [$qrId]
    );
    $updatedQr = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ApiResponse::success('QR Code updated successfully', $updatedQr ?? null)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}

// Helper validation function (would be in /lib/validation.php)
function validateData(array $data, array $rules): array {
    $errors = [];
    // Implement validation logic here
    return $errors;
}