<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

// Define type mapping with validation rules
const TYPE_MAPPING = [
    'vCards' => [
        'table' => 'vcard_qr_codes',
        'validation' => [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
        ]
    ],
    'classics' => [
        'table' => 'classic_qr_codes',
        'validation' => [
            'targetUrl' => 'required|url|max:255'
        ]
    ]
];

$db = DB::getInstance();

try {
    // Validate session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) ApiResponse::unauthorized()->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

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

    // Get dynamic fields from database schema
    $stmt = $db->execute("SHOW COLUMNS FROM {$typeConfig['table']}");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $specificFields = array_diff($columns, ['qrCodeId']);

    // Validate data
    $validationErrors = validateData($data, $typeConfig['validation']);
    if (!empty($validationErrors)) {
        ApiResponse::clientError('Validation failed', $validationErrors)->send();
    }

    // Check for duplicate name (excluding current QR)
    if (isset($data['name'])) {
        $stmt = $db->execute(
            "SELECT id FROM qr_codes WHERE userId = ? AND name = ? AND id != ?",
            [$userId, $data['name'], $qrId]
        );
        if ($stmt->fetch()) ApiResponse::clientError('QR code name already exists')->send();
    }

    // Database Update (Transaction)
    $db->execute("START TRANSACTION");

    try {
        // Update main QR codes table
        $baseFields = ['name', 'updatedAt' => 'NOW()'];
        $baseParams = [trim($input['name']), $qrId, $userId];
        
        $db->execute(
            "UPDATE qr_codes SET name = ?, updatedAt = NOW() WHERE id = ? AND userId = ?",
            $baseParams
        );

        // Update type-specific table
        $setParts = [];
        $params = [];
        
        foreach ($specificFields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "`$field` = ?";
                $params[] = is_string($data[$field]) ? trim($data[$field]) : $data[$field];
            }
        }

        if (!empty($setParts)) {
            $params[] = $qrId;
            $db->execute(
                "UPDATE {$typeConfig['table']} SET " . implode(', ', $setParts) . " WHERE qrCodeId = ?",
                $params
            );
        }

        $db->execute("COMMIT");
    } catch (Exception $e) {
        $db->execute("ROLLBACK");
        throw $e;
    }

    // Get updated QR code
    $stmt = $db->execute(
        "SELECT q.*, t.* FROM qr_codes q
         LEFT JOIN {$typeConfig['table']} t ON q.id = t.qrCodeId
         WHERE q.id = ?",
        [$qrId]
    );
    
    $updatedQr = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($updatedQr) unset($updatedQr['qrCodeId']);

    ApiResponse::success('QR code updated', $updatedQr)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}

// Simplified validation function
function validateData(array $data, array $rules): array {
    $errors = [];
    foreach ($rules as $field => $rule) {
        if (str_contains($rule, 'required') && empty($data[$field])) {
            $errors[$field] = "$field is required";
        }
    }
    return $errors;
}