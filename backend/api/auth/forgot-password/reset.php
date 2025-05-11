<?php

require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../db/ApiResponse.php';
require_once '../../../lib/session.php';
require_once '../../../lib/mailer.php';

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if ($userId) {
        ApiResponse::clientError('You are already logged in')->send();
    }

    if (isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
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
        ApiResponse::clientError('Invalid or expired token')->send();
    }

    // Validate password
    if (empty($input['password']) || empty($input['passwordConfirmation'])) {
        ApiResponse::clientError('Password and confirmation are required')->send();
    }

    if (strlen($input['password']) < 5) {
        ApiResponse::clientError('Password must be at least 5 characters long')->send();
    }

    if ($input['password'] !== $input['passwordConfirmation']) {
        ApiResponse::clientError('Passwords do not match')->send();
    }

    // Update the user's password in the database (ensure the email is confirmed)
    $updatedRowsNum = $db->update(
        "users", 
        ["password" => password_hash($input['password'], PASSWORD_BCRYPT)],
        [
            "id" => $userId,
            "isEmailConfirmed" => 1
        ]
    );

    if ($updatedRowsNum === 0) {
        ApiResponse::notFound()->send();
    }

    ApiResponse::success('Password updated successfully', $updatedRowsNum)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}