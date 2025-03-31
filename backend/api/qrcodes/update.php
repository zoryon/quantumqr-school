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
            // ... other validation rules
        ]
    ],
    'classics' => [
        'table' => 'classicqrcodes',
        'fields' => ['websiteUrl'],
        'validation' => [
            'websiteUrl' => 'required|url|max:255'
        ]
    ]
];

$db = DB::getInstance();

try {
    // Validate session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        $db->setStatus(401)
            ->setResponse([
                'success' => false,
                'message' => 'Unauthorized',
                'body' => null
            ])
            ->send();
    }

    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'], $input['type'])) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid request data',
                'body' => null
            ])
            ->send();
    }

    $qrId = (int)$input['id'];
    $type = $input['type'];

    // Validate type
    if (!array_key_exists($type, TYPE_MAPPING)) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid QR code type',
                'body' => null
            ])
            ->send();
    }

    $typeConfig = TYPE_MAPPING[$type];
    $data = $input;
    unset($data['id'], $data['type']);

    // Validate data
    $validationErrors = validateData($data, $typeConfig['validation']);
    if (!empty($validationErrors)) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Validation failed',
                'body' => $validationErrors
            ])
            ->send();
    }

    // Check for duplicate name (excluding current QR)
    $existing = $db->executeQuery(
        "SELECT id FROM qrcodes WHERE userId = ? AND name = ? AND id != ?",
        [$userId, $data['name'], $qrId]
    );

    if (!empty($existing)) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'A QR Code with the same name already exists',
                'body' => null
            ])
            ->send();
    }

    // Start transaction
    $db->executeQuery("START TRANSACTION");

    try {
        // Update main QR code
        $db->update(
            "UPDATE qrcodes SET name = ?, updatedAt = NOW() WHERE id = ? AND userId = ?",
            [$data['name'], $qrId, $userId]
        );

        // Build type-specific update
        $setParts = [];
        $params = [];
        foreach ($typeConfig['fields'] as $field) {
            if (isset($data[$field])) {
                $setParts[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        $params[] = $qrId; // For WHERE clause

        $db->update(
            "UPDATE {$typeConfig['table']} SET " . implode(', ', $setParts) . " WHERE qrCodeId = ?",
            $params
        );

        $db->executeQuery("COMMIT");
    } catch (Exception $e) {
        $db->executeQuery("ROLLBACK");
        throw $e;
    }

    // Get updated QR code
    $updatedQr = $db->executeQuery(
        "SELECT q.*, t.* FROM qrcodes q
         LEFT JOIN {$typeConfig['table']} t ON q.id = t.qrCodeId
         WHERE q.id = ?",
        [$qrId]
    );

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'QR Code updated successfully',
            'body' => $updatedQr[0] ?? null
        ])
        ->send();

} catch (Exception $e) {
    error_log('Update error: ' . $e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => 'Internal server error',
            'body' => null
        ])
        ->send();
}

// Helper validation function (would be in validation.php)
function validateData(array $data, array $rules): array {
    $errors = [];
    // Implement validation logic here
    return $errors;
}