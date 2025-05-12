<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php'; 

// Define mapping between QR types and their database tables, including validation rules
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

if ($_SERVER['REQUEST_METHOD'] !== 'PUT')  ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Validate user session and check for ban status
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) ApiResponse::unauthorized('Invalid session or not logged in')->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Get and decode input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Check for required 'id' and 'type' in input
    if (!$input || !isset($input['id'], $input['type'])) ApiResponse::clientError('Missing ID or type')->send();

    $qrId = (int)$input['id'];
    $type = $input['type'];

    // Validate the provided QR type against the predefined mapping
    if (!array_key_exists($type, TYPE_MAPPING)) {
        ApiResponse::clientError('Invalid QR code type provided')->send();
    }

    $typeConfig = TYPE_MAPPING[$type];
    // Separate the data fields to be updated from the ID and type
    $data = $input;
    unset($data['id'], $data['type']);

    // Get the actual column names for the type-specific database table from the schema
    $stmt = $db->execute("SHOW COLUMNS FROM {$typeConfig['table']}");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $specificFields = array_diff($columns, ['qrCodeId']); // Exclude the foreign key column

    // Perform data validation using the specified rules for the QR type
    $validationErrors = validateData($data, $typeConfig['validation']);
    // If validation fails, return a client error with details
    if (!empty($validationErrors)) ApiResponse::clientError('Validation failed', $validationErrors)->send();

    // Check if a QR code with the same name already exists for this user,
    // excluding the QR code being updated itself
    if (isset($data['name'])) {
        $stmt = $db->execute(
            "SELECT id FROM qr_codes WHERE userId = ? AND name = ? AND id != ?",
            [$userId, trim($data['name']), $qrId]
        );
        // If a duplicate name is found, return a client error
        if ($stmt->fetch()) ApiResponse::clientError('QR code name already exists')->send();
    }

    // Begin a transaction to ensure both updates (main table and type-specific) are atomic
    $db->execute("START TRANSACTION");

    try {
        // Update the main 'qr_codes' table with common fields like name and updated timestamp
        $db->execute(
            "UPDATE qr_codes SET name = ?, updatedAt = NOW() WHERE id = ? AND userId = ?",
            [trim($input['name']), $qrId, $userId]
        );

        // Prepare and execute the update for the type-specific table
        $setParts = [];
        $params = [];

        // Build the SET clause and parameter list dynamically based on valid specific fields in input
        foreach ($specificFields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "`$field` = ?";
                // Trim string values, keep other types as is
                $params[] = is_string($data[$field]) ? trim($data[$field]) : $data[$field];
            }
        }

        // If there are specific fields to update, build and execute the UPDATE query
        if (!empty($setParts)) {
            $params[] = $qrId; // Add the qrCodeId for the WHERE clause
            $db->execute(
                "UPDATE {$typeConfig['table']} SET " . implode(', ', $setParts) . " WHERE qrCodeId = ?",
                $params
            );
        }

        // If both updates were successful, commit the transaction
        $db->execute("COMMIT");
    } catch (Exception $e) {
        // If any exception occurs during the transaction, roll back changes
        $db->execute("ROLLBACK");
        // Re-throw the exception to be caught by the outer catch block
        throw $e;
    }

    // After successful update, fetch the combined updated QR code data
    $stmt = $db->execute(
        "SELECT q.*, t.* FROM qr_codes q
         LEFT JOIN {$typeConfig['table']} t ON q.id = t.qrCodeId
         WHERE q.id = ?",
        [$qrId]
    );

    // Fetch the updated data and remove the foreign key field
    $updatedQr = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($updatedQr) unset($updatedQr['qrCodeId']);

    ApiResponse::success('QR code updated successfully', $updatedQr)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}

// A function to perform 'required' validation based on rules
function validateData(array $data, array $rules): array {
    $errors = [];
    foreach ($rules as $field => $ruleString) {
        // Check if the 'required' rule is present and the field is missing or empty
        if (str_contains($ruleString, 'required') && (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null)) {
            $errors[$field] = "$field is required";
        }
    }
    return $errors;
}