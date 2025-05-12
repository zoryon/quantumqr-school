<?php

require_once '../../../vendor/autoload.php';
require_once '../../../db/DB.php';
require_once '../../../db/ApiResponse.php';

use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$MAILER_SECRET = '0f98a88ce3ca074d1db8b8fe7d1f77e3c3153b5a667a5d105194511daced5392'; // Secret key for JWT email confirmation tokens
$WEBSITE_URL = 'http://localhost:3000'; // Base URL for the email confirmation link
$SMTP_FROM = 'auth@quantumqr.it'; // Sender email address for confirmation emails

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
};

$db = DB::getInstance();

try {
    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Define the required fields and their expected types for registration
    $requiredFields = [
        'email' => 'string',
        'username' => 'string',
        'password' => 'string',
        'passwordConfirmation' => 'string',
        'hasAllowedEmails' => 'boolean' 
    ];

    // Validate the presence and type of each required field
    foreach ($requiredFields as $field => $type) {
        if (!isset($input[$field]) || gettype($input[$field]) !== $type) {
            ApiResponse::clientError('Invalid parameters: Missing or incorrect type for ' . $field)->send(); 
        }

        // For string fields, also check if they are empty after trimming whitespace
        if ($type === 'string' && empty(trim($input[$field]))) {
            ApiResponse::clientError('Invalid parameters: Empty string for ' . $field)->send(); 
        }
    }

    // Validate specific inputs
    if (strlen($input['username']) < 2) {
        ApiResponse::clientError('Username must be at least 2 characters long')->send();
    }

    if (strlen($input['password']) < 5) {
        ApiResponse::clientError('Password must be at least 5 characters long')->send();
    }

    if ($input['password'] !== $input['passwordConfirmation']) {
        ApiResponse::clientError('Passwords do not match')->send();
    }

    // Check if a user with the provided email or username already exists
    $stmt = $db->execute(
        "SELECT * FROM active_users WHERE email = ? OR username = ?", [
            $input['email'],
            $input['username']
        ]
    );
    $existingUserArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $existingUser = $existingUserArray[0] ?? null; // Get the first result or null if none

    if (!empty($existingUser))  ApiResponse::conflict('User with this email or username already exists. Please login instead.')->send();

    // Hash the user's password before storing it in the database
    $hashedPasswd = password_hash($input['password'], PASSWORD_BCRYPT);

    // Insert the new user record into the 'users' table
    $userId = $db->insert("users", [
        "email" => $input['email'],
        "username" => $input['username'],
        "password" => $hashedPasswd,
        "hasAllowedEmails" => $input['hasAllowedEmails'], 
        "isEmailConfirmed" => false // User is not confirmed upon registration
    ]);
    if (!$userId) ApiResponse::internalServerError('Failed to create user record')->send();

    // Create a JWT payload with the new user's ID and an expiration time (10 minutes)
    $payload = [
        'userId' => $userId,
        'exp' => time() + 600 // Token expires 10 minutes
    ];

    // Encode the payload into a JWT using the defined secret key and HS256 algorithm
    $token = JWT::encode($payload, $MAILER_SECRET, 'HS256');
    // Construct the full email confirmation link
    $link = "$WEBSITE_URL/register/confirm?token=$token";

    $mail = new PHPMailer(true); // 'true' enables exceptions

    // Server settings
    $mail->isSMTP();                                    // Send using SMTP
    $mail->Host = 'smtp.gmail.com';                     // Set the SMTP server to send through
    $mail->SMTPAuth = true;                             // Enable SMTP authentication
    $mail->Username = 'test.zoryon@gmail.com';           // SMTP username (my email address)
    $mail->Password = 'jeor fpgn biim rkbo';            // SMTP password (my email app password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;    // Enable implicit TLS encryption
    $mail->Port = 465;                                  // TCP port to connect to

    // Recipients
    $mail->setFrom($SMTP_FROM);         // Set sender email address and optional name
    $mail->addAddress($input['email']); // Add a recipient (the user's email)

    // Content
    $mail->isHTML(true);                            // Set email format to HTML
    $mail->Subject = 'Confirm Your Email Address';  // Email subject
    $mail->Body = "
        <html>
            <body>
                <p>Thank you for registering! Please click the link below to confirm your email address:</p>
                <p><a href=\"$link\">Confirm Your Email</a></p>
                <p>This link will expire in 10 minutes.</p>
                <p>If you did not register for an account, please ignore this email.</p>
            </body>
        </html>
    "; 

    $mail->send(); 

    ApiResponse::success('Registration successful. Please check your email to confirm your account.', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError('An error occurred during registration. Please try again later.')->send(); 
}