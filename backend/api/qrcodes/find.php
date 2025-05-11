<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

// Definizione del mapping dei tipi
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
    // Validazione sessione
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        ApiResponse::unauthorized()->send();
    }

    if (isBanned($userId)) {
        ApiResponse::forbidden("You are under a ban currently")->send();
    }

    // Recupero e validazione parametri
    $qrCodeId = $_GET['id'] ?? null;
    $type = $_GET['type'] ?? null;

    if (!$qrCodeId || !filter_var($qrCodeId, FILTER_VALIDATE_INT)) {
        ApiResponse::clientError('Invalid QR code ID')->send();
    }

    if (!$type || !array_key_exists($type, TYPE_MAPPING)) {
        ApiResponse::clientError('Invalid or missing QR code type')->send();
    }

    // Recupero QR code base
    $baseQr = $db->selectOne("qr_codes", ["id" => $qrCodeId]);

    if (empty($baseQr)) {
        ApiResponse::notFound('QR Code not found')->send();
    }

    $isOwner = (int)$userId === (int)$baseQr['userId'];

    // --- Fetch Type-Specific Data ---
    $typeConfig = TYPE_MAPPING[$type];
    $specificTableName = $typeConfig['table'];
    $fields = implode(', ', $typeConfig['fields']);
    
    $specificData = $db->selectOne($specificTableName, ["qrCodeId" => $qrCodeId]);

    if (empty($specificData)) {
        ApiResponse::notFound('Detailed QR code data not found')->send();
    }

    // Costruzione risposta
    $response = [
        'type' => $type,
        'isOwner' => $isOwner,
        'url' => $baseQr['url']
    ];

    // Aggiungi campi specifici
    foreach ($typeConfig['fields'] as $field) {
        if (isset($specificData[$field])) {
            $response[$field] = $specificData[$field];
        }
    }

    // Se è il proprietario, aggiungi tutti i dettagli
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