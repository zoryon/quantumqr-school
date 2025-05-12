<?php

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../db/ApiResponse.php';
require_once '../../../lib/session.php';
require_once '../../../lib/mailer.php'; 

$WEBSITE_URL = 'http://localhost:3000'; // Base URL for the password reset link
$RESET_SECRET = '765bdd7a336d24a41f64d023915735cf6164eedbee20bb1f6b57e96a13eb5502'; // Secret key for JWT signing
$SMTP_FROM = 'auth@quantumqr.it'; // Sender email address for the reset email

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check if a session token exists (meaning the user is already logged in)
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if ($userId) ApiResponse::forbidden('You are already logged in. Please log out if you wish to reset your password.')->send(); 

    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input: ensure 'emailOrUsername' is provided and not empty
    if (empty(trim($input['emailOrUsername']))) {
        ApiResponse::clientError('Either email or username is required')->send();
    }

    // Find the user by email or username in the active_users table
    $stmt = $db->execute(
        "SELECT id, email, username
         FROM active_users
         WHERE email = ? OR username = ?
         ",
        [$input['emailOrUsername'], $input['emailOrUsername']]
    );
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($users) || $users === null) ApiResponse::notFound()->send(); 

    // Assume the first result is the correct user (should be unique)
    $user = $users[0];

    // Generate the JWT payload containing user ID and expiration time (10 minutes)
    $payload = [
        'userId' => $user['id'],
        'exp' => time() + 600 // Token expires in 600 seconds (10 minutes)
    ];

    // Encode the payload into a JWT using the defined secret key and HS256 algorithm
    $resetToken = JWT::encode($payload, $RESET_SECRET, 'HS256');
    // Construct the full password reset link
    $link = "$WEBSITE_URL/forgot-password?token=$resetToken";

    // --- Email Sending Configuration and Logic with PHPMailer ---
    $mail = new PHPMailer(true); // 'true' enables exceptions
    // Server settings
    $mail->isSMTP();                                    // Send using SMTP
    $mail->Host = 'smtp.gmail.com';                     // Set the SMTP server to send through
    $mail->SMTPAuth = true;                             // Enable SMTP authentication
    $mail->Username = 'dev.meucci@gmail.com';           // SMTP username (my email address)
    $mail->Password = 'bbza frnd lszq hkmw';            // SMTP password (my email app password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;    // Enable implicit TLS encryption
    $mail->Port = 465;                                  // TCP port to connect to

    // Recipients
    $mail->setFrom($SMTP_FROM);         // Set sender name
    $mail->addAddress($user['email']);  // Add user's email)

    // Content
    $mail->isHTML(true);                        // Set email format to HTML
    $mail->Subject = 'Password Reset Request';  // Email subject
    $htmlBody = "
        <html>
            <body>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href=\"$link\">Reset your password</a></p>
                <p>This link will expire in 10 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </body>
        </html>
    ";
    $mail->Body = $htmlBody;    // HTML body of the email

    $mail->send(); 

    ApiResponse::success('If a user with that email or username exists, a password reset link will be sent. Please check your email.', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError('An error occurred while processing your request. Please try again later.')->send();
}