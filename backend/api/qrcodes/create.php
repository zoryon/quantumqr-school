<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';
require_once '../../lib/qrcode.php';

// Validate POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    DB::getInstance()
        ->setStatus(405)
        ->setResponse([
            'success' => false,
            'message' => 'Method not allowed',
            'body' => null
        ])
        ->send();
}

$db = DB::getInstance();

try {
    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'Not found', // Confusing unauthorized users 
                'body' => null
            ])
            ->send();
    }

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['qrType']) || empty(trim($input['qrType']))) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid input',
                'body' => null
            ])
            ->send();
    }

    // Validate name length
    if (isset($input['name']) && strlen(trim($input['name'])) > 20) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Name must be less than 20 characters',
                'body' => null
            ])
            ->send();
    }

    // Route based on QR type
    $qrType = trim($input['qrType']);
    switch ($qrType) {
        case 'vCards':
            $qrCode = createVCardQR($userId, $input);
            break;
        case 'classics':
            $qrCode = createClassicQR($userId, $input);
            break;
        default:
            $db->setStatus(400)
                ->setResponse([
                    'success' => false,
                    'message' => 'Invalid QR code type',
                    'body' => null
                ])
                ->send();
    }

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'QR code created successfully',
            'body' => $qrCode
        ])
        ->send();
} catch (Exception $e) {
    error_log($e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => $e->getMessage(),
            'body' => null
        ])
        ->send();
}
