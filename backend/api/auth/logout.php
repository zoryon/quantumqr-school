<?php

require_once '../../db/DB.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Gestione della richiesta POST
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    // Gestione di altri metodi HTTP
    DB::getInstance()
    ->setStatus(405)
    ->setResponse([
        'success' => false,
        'message' => 'Method not allowed',
        'body' => null
    ])
    ->send();
};

try {
    $db = DB::getInstance();

    if (!isset($_COOKIE['session_token'])) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'You are not logged in',
                'body' => null
            ])
            ->send();
    }

    setcookie(
        'session_token', 
        '', 
        time() - 3600, 
        "/", 
        "", 
        false, 
        true
    );

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Logged out successfully',
            'body' => true
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
?>