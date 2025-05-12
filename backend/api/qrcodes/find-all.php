<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

// Define mapping between QR type names and their corresponding database tables
const TYPE_MAPPING = [
    'vCards' => 'vcard_qr_codes',
    'classics' => 'classic_qr_codes'
];

try {
    // Validate user session and check for ban status
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) ApiResponse::unauthorized('Invalid session or not logged in')->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Dynamically fetch columns for each type-specific QR table (excluding the join key)
    $typeColumns = [];
    foreach (TYPE_MAPPING as $type => $table) {
        $stmt = $db->execute("SHOW COLUMNS FROM $table");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $typeColumns[$type] = array_diff($columns, ['qrCodeId']); // Exclude the foreign key column
    }

    // Construct an SQL query to fetch all QR codes for the user,
    // Joining with type-specific tables to get all potential data
    $sql = "SELECT q.*, v.*, c.*
            FROM qr_codes AS q
            LEFT JOIN vcard_qr_codes AS v ON q.id = v.qrCodeId
            LEFT JOIN classic_qr_codes AS c ON q.id = c.qrCodeId
            WHERE q.userId = ?"; // Filter by the current user's ID

    // Execute the query to get all QR codes for the user with joined data
    $stmt = $db->execute($sql, [$userId]);
    $qrCodes = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: []; // Fetch all results

    // Process the raw results to structure the data per QR code type
    $result = [];
    foreach ($qrCodes as $qr) {
        // Initialize entry with common QR code fields
        $entry = [
            'id' => (int)$qr['id'],
            'name' => $qr['name'],
            'url' => $qr['url'], 
            'scans' => (int)$qr['scans'],
            'createdAt' => $qr['createdAt'],
            'updatedAt' => $qr['updatedAt'],
            'type' => 'unknown' // Default type
        ];

        // Iterate through defined QR types to detect the specific type of the current QR code
        foreach (TYPE_MAPPING as $type => $table) {
            // Check if any column from this type's table is populated in the current row
            // This indicates the type of the QR code
            foreach ($typeColumns[$type] as $col) {
                if (isset($qr[$col]) && $qr[$col] !== null) { 
                    // If type is detected, collect all columns relevant to this type
                    foreach ($typeColumns[$type] as $field) {
                        if (isset($qr[$field])) {
                            $entry[$field] = $qr[$field];
                        }
                    }
                    $entry['type'] = $type; // Set the detected type
                    break 2; // Exit both inner loops once the type is found and data collected
                }
            }
        }

        // Clean up the final entry: remove null values and the foreign key column if present
        $entry = array_filter($entry, fn($v, $k) => $v !== null && $k !== 'qrCodeId', ARRAY_FILTER_USE_BOTH);

        // Add the processed QR code entry to the final result array
        $result[] = $entry;
    }

    ApiResponse::success('QR codes retrieved successfully', $result)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}