<?php

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;

require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../lib/session.php';
require_once '../../../lib/mailer.php';

$WEBSITE_URL = 'http://localhost:3000';
$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';
$RESET_SECRET = '765bdd7a336d24a41f64d023915735cf6164eedbee20bb1f6b57e96a13eb5502';
$SMTP_FROM = 'auth@quantumqr.it';

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
        'emailOrUsername' => 'string',
    ];

    // Validate inputs
    if (empty(trim($input['emailOrUsername']))) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Either email or username is required',
                'body' => null
            ])
            ->send();
    }

    // Find the user by email or username
    $stmt = $db->execute(
        "SELECT id, email, username
        FROM users
        WHERE email = ? OR username = ?
        AND isEmailConfirmed = 1
        ", 
        [$input['emailOrUsername'], $input['emailOrUsername']]
    );
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($users)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found',
                'body' => null
            ])
            ->send();
    }
    $user = $users[0];

    // Generazione token JWT
    $payload = [
        'userId' => $user['id'],
        'exp' => time() + 600 // 10 minuti
    ];

    $resetToken = JWT::encode($payload, $RESET_SECRET, 'HS256');
    $link = "$WEBSITE_URL/forgot-password?token=$resetToken";

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
    $mail->addAddress($user['email']);
    $mail->Subject = 'Reset Password Request';
    $mail->Body = "<p>Reset your password: <a href=\"$link\">Click here</a></p>";
    $mail->send();
    
    // Successful response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Please check your email to reset your password.',
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