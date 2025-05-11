<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';

use Firebase\JWT\JWT;

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
};

$db = DB::getInstance();

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $requiredFields = [
        'emailOrUsername' => 'string',
        'password' => 'string',
    ];

    foreach ($requiredFields as $field => $type) {
        if (!isset($input[$field]) || gettype($input[$field]) !== $type) {
            ApiResponse::clientError('Invalid parameters.')->send();
        }
    
        // Verifica ulteriore per i campi stringa: non devono essere vuoti dopo il trim
        if ($type === 'string' && empty(trim($input[$field]))) {
            ApiResponse::clientError('Invalid parameters')->send();
        }
    }

    // Creazione utente
    $stmt = $db->execute(
        "SELECT * FROM active_users WHERE (email = ? OR username = ?)", [
            $input['emailOrUsername'],
            $input['emailOrUsername'],
        ]
    );

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$users || empty($users)) {
        ApiResponse::notFound('User not found')->send();
    }

    $user = $users[0];

    // Verify password
    if (!password_verify($input['password'], $user['password'])) {
        ApiResponse::unauthorized('Invalid password')->send();
    }

    // Generazione token JWT
    $expires = time() + (7 * 24 * 60 * 60);

    $payload = [
        'userId' => $user['id'],
        'exp' => $expires // 7 days
    ];

    $token = JWT::encode($payload, $SESSION_SECRET, 'HS256');

    // Set cookie
    setcookie(
        'session_token',
        $token,
        [
            'expires' => $expires,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => $_SERVER['HTTP_HOST'] !== 'localhost'
        ]
    );    

    // Risposta di successo
    ApiResponse::success('Logged in successfully, you\'ll be redirected shortly..', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}