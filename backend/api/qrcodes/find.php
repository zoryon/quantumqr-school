<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    DB::getInstance()
        ->setStatus(405)
        ->setResponse([
            'success' => false,
            'message' => 'Method not allowed',
            'body' => null
        ])
        ->send();
}

// Definizione del mapping dei tipi
const TYPE_MAPPING = [
    'vCards' => [
        'table' => 'vcardqrcodes',
        'fields' => ['firstName', 'lastName', 'phoneNumber', 'email', 'address', 'websiteUrl']
    ],
    'classics' => [
        'table' => 'classicqrcodes',
        'fields' => ['websiteUrl']
    ]
];

$db = DB::getInstance();

try {
    // Validazione sessione
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        $db->setStatus(401)
            ->setResponse([
                'success' => false,
                'message' => 'Unauthorized access',
                'body' => null
            ])
            ->send();
    }

    // Recupero e validazione parametri
    $qrCodeId = $_GET['id'] ?? null;
    $type = $_GET['type'] ?? null;

    if (!$qrCodeId || !filter_var($qrCodeId, FILTER_VALIDATE_INT)) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid QR code ID',
                'body' => null
            ])
            ->send();
    }

    if (!$type || !array_key_exists($type, TYPE_MAPPING)) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid or missing QR code type',
                'body' => null
            ])
            ->send();
    }

    // Recupero QR code base
    $baseQr = $db->executeQuery(
        "SELECT * FROM qrcodes WHERE id = ?",
        [$qrCodeId]
    );

    if (empty($baseQr)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'QR Code not found',
                'body' => null
            ])
            ->send();
    }

    $baseQr = $baseQr[0];
    $isOwner = (int)$userId === (int)$baseQr['userId'];

    // Recupero dati specifici usando TYPE_MAPPING
    $typeConfig = TYPE_MAPPING[$type];
    $fields = implode(', ', $typeConfig['fields']);
    
    $specificData = $db->executeQuery(
        "SELECT $fields FROM {$typeConfig['table']} WHERE qrCodeId = ?",
        [$qrCodeId]
    );

    if (empty($specificData)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'Detailed QR code data not found',
                'body' => null
            ])
            ->send();
    }

    $specificData = $specificData[0];

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

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'QR code retrieved successfully',
            'body' => $response
        ])
        ->send();

} catch (Exception $e) {
    error_log('QR code fetch error: ' . $e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => 'Internal server error',
            'body' => null
        ])
        ->send();
}