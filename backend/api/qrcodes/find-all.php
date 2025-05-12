<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

// Define QR types and their tables
const TYPE_MAPPING = [
    'vCards' => 'vcard_qr_codes',
    'classics' => 'classic_qr_codes'
];

try {
    // Session validation
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) ApiResponse::unauthorized()->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Get columns for each QR type
    $typeColumns = [];
    foreach (TYPE_MAPPING as $type => $table) {
        $stmt = $db->execute("SHOW COLUMNS FROM $table");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $typeColumns[$type] = array_diff($columns, ['qrCodeId']);
    }

    // Build query with all columns
    $sql = "SELECT q.*, v.*, c.* 
            FROM qr_codes AS q
            LEFT JOIN vcard_qr_codes AS v ON q.id = v.qrCodeId
            LEFT JOIN classic_qr_codes AS c ON q.id = c.qrCodeId
            WHERE q.userId = ?";

    // Execute query
    $stmt = $db->execute($sql, [$userId]);
    $qrCodes = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Process results
    $result = [];
    foreach ($qrCodes as $qr) {
        $entry = [
            'id' => (int)$qr['id'],
            'name' => $qr['name'],
            'url' => $qr['url'],
            'scans' => (int)$qr['scans'],
            'createdAt' => $qr['createdAt'],
            'updatedAt' => $qr['updatedAt'],
            'type' => 'unknown'
        ];

        // Detect QR type and collect fields
        foreach (TYPE_MAPPING as $type => $table) {
            foreach ($typeColumns[$type] as $col) {
                if (!empty($qr[$col])) {
                    // Found matching type, collect all its fields
                    foreach ($typeColumns[$type] as $field) {
                        if (isset($qr[$field])) {
                            $entry[$field] = $qr[$field];
                        }
                    }
                    $entry['type'] = $type;
                    break 2; // Exit both loops
                }
            }
        }

        // Remove null values and QR code IDs
        $entry = array_filter($entry, fn($v) => $v !== null && !str_ends_with($v, 'qrCodeId'));

        $result[] = $entry;
    }

    ApiResponse::success('QR codes retrieved successfully', $result)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}