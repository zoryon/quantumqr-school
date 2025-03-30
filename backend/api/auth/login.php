<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';

use Firebase\JWT\JWT;

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Gestione della richiesta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

    // Lettura del body della richiesta
    $input = json_decode(file_get_contents('php://input'), true);

    // Validazione parametri
    $requiredFields = [
        'emailOrUsername' => 'string',
        'password' => 'string',
    ];

    foreach ($requiredFields as $field => $type) {
        // Verifica se il campo è presente e del tipo corretto
        if (!isset($input[$field]) || gettype($input[$field]) !== $type) {
            $db->setStatus(400)
                ->setResponse([
                    'success' => false,
                    'message' => 'Invalid parameters.',
                    'body' => null
                ])
                ->send();
        }
    
        // Verifica ulteriore per i campi stringa: non devono essere vuoti dopo il trim
        if ($type === 'string' && empty(trim($input[$field]))) {
            $db->setStatus(400)
                ->setResponse([
                    'success' => false,
                    'message' => 'Invalid parameters.',
                    'body' => null
                ])
                ->send();
        }
    }

    // Creazione utente
    $users = $db->executeQuery(
        "SELECT * FROM users WHERE (email = ? OR username = ?) AND isEmailConfirmed = 1",
        [
            $input['emailOrUsername'],
            $input['emailOrUsername']
        ]
    );

    if (empty($users)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found.',
                'body' => null
            ])
            ->send();
    }

    $user = $users[0];

    // Verify password
    if (!password_verify($input['password'], $user['password'])) {
        $db->setStatus(401)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid password',
                'body' => null
            ])
            ->send();
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
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Logged in successfully, you\'ll be redirected shortly..',
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