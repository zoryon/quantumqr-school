<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') ApiResponse::methodNotAllowed()->send();

// Define mapping between QR type names and their corresponding database tables
const TYPE_MAPPING = [
    'vCards' => 'vcard_qr_codes',
    'classics' => 'classic_qr_codes',
];

$db = DB::getInstance();

try {
    // Attempt to retrieve user ID if a session token exists
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if ($userId && isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Get QR code ID and type from query parameters
    $qrCodeId = $_GET['id'] ?? null;
    $type = $_GET['type'] ?? null;

    // Validate required query parameters
    if (!$qrCodeId || !filter_var($qrCodeId, FILTER_VALIDATE_INT)) ApiResponse::clientError('Invalid or missing QR code ID')->send();

    if (!$type || !array_key_exists($type, TYPE_MAPPING)) ApiResponse::clientError('Invalid or missing QR code type')->send();

    // Fetch the base QR code data from the main table using the provided ID
    $baseQr = $db->selectOne("qr_codes", ["id" => $qrCodeId]);

    if ($baseQr === null || empty($baseQr)) ApiResponse::notFound('QR Code not found')->send();

    // Determine if the current logged-in user is the owner of this QR code
    $isOwner = $userId !== null && (int)$userId === (int)$baseQr['userId'];

    // Determine the specific table name based on the validated QR type
    $specificTableName = TYPE_MAPPING[$type];
    
    // Fetch the type-specific data from the corresponding table
    $specificData = $db->selectOne($specificTableName, ["qrCodeId" => $qrCodeId]);
    if ($specificData === null) ApiResponse::notFound('Detailed QR code data not found for this type')->send(); 

    // Remove the foreign key ('qrCodeId') from the type-specific data before returning
    unset($specificData['qrCodeId']);

    // Build the core response array, including common fields and ownership status
    $response = [
        'type' => $type,
        'isOwner' => $isOwner,
        'url' => $baseQr['url'] 
    ];

    // Dynamically add all fields from the fetched type-specific data to the response
    foreach ($specificData as $key => $value) {
        $response[$key] = $value;
    }

    // If the requesting user is the owner, include additional owner-specific details
    if ($isOwner) {
        $response = array_merge($response, [
            'id' => (int)$baseQr['id'],
            'name' => $baseQr['name'],
            'userId' => (int)$baseQr['userId'],
            'createdAt' => $baseQr['createdAt'],
            'updatedAt' => $baseQr['updatedAt'],
            'scans' => (int)$baseQr['scans'],
        ]);
    }

    ApiResponse::success('QR code retrieved successfully', $response)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}