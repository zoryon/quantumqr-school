<?php
require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../db/ApiResponse.php';

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;

$MAILER_SECRET = '0f98a88ce3ca074d1db8b8fe7d1f77e3c3153b5a667a5d105194511daced5392';
$WEBSITE_URL = 'http://localhost:3000';
$SMTP_FROM = 'auth@quantumqr.it';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
};

$db = DB::getInstance();

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $requiredFields = [
        'email' => 'string',
        'username' => 'string',
        'password' => 'string',
        'passwordConfirmation' => 'string',
        'hasAllowedEmails' => 'boolean'
    ];

    foreach ($requiredFields as $field => $type) {
        if (!isset($input[$field]) || gettype($input[$field]) !== $type) {
            ApiResponse::clientError('Invalid parameters')->send();
        }
    
        if ($type === 'string' && empty(trim($input[$field]))) {
            ApiResponse::clientError('Invalid parameters')->send();
        }
    }

    if (strlen($input['username']) < 2) {
        ApiResponse::clientError('Username must be at least 2 characters long')->send();
    }

    if (strlen($input['password']) < 5) {
        ApiResponse::clientError('Password must be at least 5 characters long')->send();
    }

    if ($input['password'] !== $input['passwordConfirmation']) {
        ApiResponse::clientError('Passwords do not match')->send();
    }

    $stmt = $db->execute(
        "SELECT * FROM active_users WHERE email = ? OR username = ?", [
            $input['email'], 
            $input['username']
        ]
    );
    $existingUserArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $existingUser = $existingUserArray[0] ?? null;

    if (!empty($existingUser)) {
        ApiResponse::conflict('User already exists. Please login instead.')->send();
    }

    // Hash password
    $hashedPasswd = password_hash($input['password'], PASSWORD_BCRYPT);

    $userId = $db->insert("users", [
        "email" => $input['email'],
        "username" => $input['username'],
        "password" => $hashedPasswd,
        "hasAllowedEmails" => $input['hasAllowedEmails'] ?? false,
        "isEmailConfirmed" => false
    ]);

    $payload = [
        'userId' => $userId,
        'exp' => time() + 600 // 10 minutes
    ];

    $token = JWT::encode($payload, $MAILER_SECRET, 'HS256');
    $link = "$WEBSITE_URL/register/confirm?token=$token";

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

    ApiResponse::success('Registration successful. Please check your email to confirm your account.', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}