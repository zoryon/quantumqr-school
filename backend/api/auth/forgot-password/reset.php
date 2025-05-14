<?php

require_once __DIR__ . '/../../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Check if a session token exists (meaning the user is already logged in)
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if ($userId) ApiResponse::clientError('You are already logged in. Please log out before resetting your password.')->send(); 
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate the reset token provided in the input
    $userId = getIdFromResetToken($input['token']);
    // If the token is invalid or expired, return an error
    if (!$userId) ApiResponse::clientError('Invalid or expired token')->send();

    // Validate password and password confirmation fields
    if (empty($input['password']) || empty($input['passwordConfirmation'])) ApiResponse::clientError('Password and confirmation are required')->send();

    // Validate password length
    if (strlen($input['password']) < 5) ApiResponse::clientError('Password must be at least 5 characters long')->send();

    // Check if password and confirmation match
    if ($input['password'] !== $input['passwordConfirmation']) ApiResponse::clientError('Passwords do not match')->send();

    // Hash the new password before storing it in the database
    $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT);

    // Update the user's password in the database
    $updatedRowsNum = $db->update(
        "users",
        ["password" => $hashedPassword],
        [
            "id" => $userId, // User ID from the validated reset token
            "isEmailConfirmed" => 1 // Only reset password for confirmed emails
        ]
    );

    // Check if the password was successfully updated for exactly one user
    if ($updatedRowsNum === 0) {
        // This could happen if the user ID from the token doesn't match a user or email isn't confirmed
        ApiResponse::notFound('User not found or email not confirmed')->send(); 
    }

    ApiResponse::success('Password updated successfully', $updatedRowsNum)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}