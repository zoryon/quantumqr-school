<?php

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;

require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../db/ApiResponse.php';
require_once '../../../lib/session.php';
require_once '../../../lib/mailer.php';

$WEBSITE_URL = 'http://localhost:3000';
$RESET_SECRET = '765bdd7a336d24a41f64d023915735cf6164eedbee20bb1f6b57e96a13eb5502';
$SMTP_FROM = 'auth@quantumqr.it';

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if ($userId) {
        ApiResponse::forbidden('You are already logged in')->send();
    }

    if (isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
    }

    // Lettura del body della richiesta
    $input = json_decode(file_get_contents('php://input'), true);

    // Validazione parametri
    $requiredFields = [
        'emailOrUsername' => 'string',
    ];

    // Validate inputs
    if (empty(trim($input['emailOrUsername']))) {
        ApiResponse::clientError('Either email or username is required')->send();
    }

    // Find the user by email or username
    $stmt = $db->execute(
        "SELECT id, email, username
        FROM active_users
        WHERE email = ? OR username = ?
        ", 
        [$input['emailOrUsername'], $input['emailOrUsername']]
    );
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($users)) {
        ApiResponse::notFound('User not found')->send();
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
    $mail->isHTML(true);
    $htmlBody = "
        <html>
            <body>
                <p>Reset your password: <a href=\"$link\">Click here</a></p>
            </body>
        </html>
    ";
    $mail->Body = $htmlBody;
    $mail->send();
    
    ApiResponse::success('Please check your email to reset your password', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}