<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';

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

try {
    $db = DB::getInstance();

    $tiers = $db->select("tiers");

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Tiers found successfully',
            'body' => $tiers
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