<?php
require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;

$MAILER_SECRET = '0f98a88ce3ca074d1db8b8fe7d1f77e3c3153b5a667a5d105194511daced5392';
$WEBSITE_URL = 'http://localhost:3000';
$SMTP_FROM = 'auth@quantumqr.it';

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

$db = DB::getInstance();

try {
    // Lettura del body della richiesta
    $input = json_decode(file_get_contents('php://input'), true);

    // Validazione parametri
    $requiredFields = [
        'email' => 'string',
        'username' => 'string',
        'password' => 'string',
        'passwordConfirmation' => 'string',
        'hasAllowedEmails' => 'boolean'
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

    // Validazioni aggiuntive
    if (strlen($input['username']) < 2) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Username must be at least 2 characters long.',
                'body' => null
            ])
            ->send();
    }

    if (strlen($input['password']) < 5) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Password must be at least 5 characters long.',
                'body' => null
            ])
            ->send();
    }

    if ($input['password'] !== $input['passwordConfirmation']) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Passwords do not match.',
                'body' => null
            ])
            ->send();
    }

    // Controllo utente esistente
    $existingUser = $db->executeQuery(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [$input['email'], $input['username']]
    );

    if (!empty($existingUser)) {
        $db->setStatus(409)
            ->setResponse([
                'success' => false,
                'message' => 'User already exists. Please login instead.',
                'body' => null
            ])
            ->send();
    }

    // Hash password
    $hashedPasswd = password_hash($input['password'], PASSWORD_BCRYPT);

    // Creazione utente
    $userId = $db->insert(
        "INSERT INTO users (email, username, password, hasAllowedEmails, isEmailConfirmed) 
            VALUES (?, ?, ?, ?, ?)",
        [
            $input['email'],
            $input['username'],
            $hashedPasswd,
            $input['hasAllowedEmails'] ?? false,
            false
        ]
    );

    if (!$userId) {
        $db->setStatus(500)
            ->setResponse([
                'success' => false,
                'message' => 'An error occurred on our end. Please try again later.',
                'body' => null
            ])
            ->send();
    }

    // Generazione token JWT
    $payload = [
        'userId' => $userId,
        'exp' => time() + 600 // 10 minuti
    ];

    $token = JWT::encode($payload, $MAILER_SECRET, 'HS256');
    $link = "$WEBSITE_URL/register/confirm?token=$token";

    // Invio email (configura PHPMailer secondo le tue esigenze)
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->Port = '465';
    $mail->SMTPAuth = true;
    $mail->Username = 'dev.meucci@gmail.com';
    $mail->Password = 'bbza frnd lszq hkmw';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

    $mail->setFrom($SMTP_FROM);
    $mail->addAddress($input['email']);
    $mail->Subject = 'Confirm Your Email';
    $mail->Body = "<p>Confirm: <a href=\"$link\">Click here</a></p>";
    $mail->send();

    // Risposta di successo
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Registration successful. Please check your email to confirm your account.',
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