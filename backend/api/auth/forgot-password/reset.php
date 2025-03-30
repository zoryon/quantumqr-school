<?php

require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../lib/session.php';
require_once '../../../lib/mailer.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle POST request
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
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if ($userId) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'You are already logged in.', 
                'body' => null
            ])
            ->send();
    }

    // Lettura del body della richiesta
    $input = json_decode(file_get_contents('php://input'), true);

    // Validazione parametri
    $requiredFields = [
        'token' => 'string',
        'password' => 'string',
        'passwordConfirmation' => 'string',
    ];

    // Validate reset token
    $userId = getIdFromResetToken($input['token']);
    if (!$userId) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid or expired token',
                'body' => null
            ])
            ->send();
    }

    // Validate password
    if (empty($input['password']) || empty($input['passwordConfirmation'])) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Password and confirmation are required',
                'body' => null
            ])
            ->send();
    }

    if (strlen($input['password']) < 5) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Password must be at least 5 characters long',
                'body' => null
            ])
            ->send();
    }

    if ($input['password'] !== $input['passwordConfirmation']) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Passwords do not match',
                'body' => null
            ])
            ->send();
    }

    // Update the user's password in the database (ensure the email is confirmed)
    $updatedRowsNum = $db->update(
        "UPDATE users 
        SET password = ?
        WHERE id = ?
        AND isEmailConfirmed = 1
        ", 
        [password_hash($input['password'], PASSWORD_BCRYPT), $userId]
    );

    if ($updatedRowsNum === 0) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found',
                'body' => null
            ])
            ->send();
    }

    // Successful response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Password updated successfully.',
            'body' => $updatedRowsNum
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