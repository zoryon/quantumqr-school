<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

const TYPE_MAPPING = [
    'vCards' => [
        'table' => 'vcard_qr_codes',
        'fields' => ['firstName', 'lastName', 'phoneNumber', 'email', 'address', 'websiteUrl']
    ],
    'classics' => [
        'table' => 'classic_qr_codes',
        'fields' => ['targetUrl']
    ]
];

$db = DB::getInstance();

try {
    $userId = null;
    $sessionToken = $_COOKIE['session_token'] ?? '';
    
    // Retrieve user ID if session token is valid
    if ($sessionToken) {
        $userId = getIdFromSessionToken($sessionToken);
    }
    
    // Check if the user is banned only if logged in
    if ($userId && isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
    }

    $qrCodeId = $_GET['id'] ?? null;
    $type = $_GET['type'] ?? null;

    if (!$qrCodeId || !filter_var($qrCodeId, FILTER_VALIDATE_INT)) {
        ApiResponse::clientError('Invalid QR code ID')->send();
    }

    if (!$type || !array_key_exists($type, TYPE_MAPPING)) {
        ApiResponse::clientError('Invalid or missing QR code type')->send();
    }

    // Fetch base QR Code
    $baseQr = $db->selectOne("qr_codes", ["id" => $qrCodeId]);

    if (empty($baseQr)) {
        ApiResponse::notFound('QR Code not found')->send();
    }

    // Check if the current user is the owner
    $isOwner = $userId !== null && (int)$userId === (int)$baseQr['userId'];

    // Fetch Type-Specific Data
    $typeConfig = TYPE_MAPPING[$type];
    $specificTableName = $typeConfig['table'];
    $fields = implode(', ', $typeConfig['fields']);
    
    $specificData = $db->selectOne($specificTableName, ["qrCodeId" => $qrCodeId]);

    if (empty($specificData)) {
        ApiResponse::notFound('Detailed QR code data not found')->send();
    }

    $response = [
        'type' => $type,
        'isOwner' => $isOwner,
        'url' => $baseQr['url']
    ];

    // Add specific fields
    foreach ($typeConfig['fields'] as $field) {
        if (isset($specificData[$field])) {
            $response[$field] = $specificData[$field];
        }
    }

    // Include owner-specific details if the user is the owner
    if ($isOwner) {
        $response = array_merge($response, [
            'id' => (int)$baseQr['id'],
            'name' => $baseQr['name'],
            'userId' => (int)$baseQr['userId'],
            'createdAt' => $baseQr['createdAt'],
            'scans' => (int)$baseQr['scans']
        ]);
    }

    ApiResponse::success('QR code retrieved successfully', $response)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}