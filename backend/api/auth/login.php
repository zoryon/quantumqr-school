<?php

require_once __DIR__ . '/../../bootstrap.php';

use Firebase\JWT\JWT;

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85'; // Secret key for JWT session tokens

if ($_SERVER['REQUEST_METHOD'] !== 'POST') ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Define the required fields and their expected types for login
    $requiredFields = [
        'emailOrUsername' => 'string',
        'password' => 'string',
    ];

    // Validate the presence and type of each required field
    foreach ($requiredFields as $field => $type) {
        if (!isset($input[$field]) || gettype($input[$field]) !== $type) {
            ApiResponse::clientError('Invalid parameters. Missing or incorrect type for ' . $field)->send(); 
        }

        // For string fields, also check if they are empty after trimming whitespace
        if ($type === 'string' && empty(trim($input[$field]))) {
            ApiResponse::clientError('Invalid parameters: Empty string for ' . $field)->send(); 
        }
    }

    // Find the user by email or username in the active_users table
    $stmt = $db->execute(
        "SELECT * FROM active_users WHERE (email = ? OR username = ?)", [
            $input['emailOrUsername'],
            $input['emailOrUsername'],
        ]
    );

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$users || empty($users)) ApiResponse::notFound('User not found')->send(); 

    // Get the first user found (unique by email/username in active_users)
    $user = $users[0];

    // Verify the provided password with the hashed password stored in the database
    if (!password_verify($input['password'], $user['password'])) ApiResponse::unauthorized('Invalid password')->send(); 

    $expires = time() + (7 * 24 * 60 * 60); // 7 days

    // Create the JWT payload containing the user ID and expiration time
    $payload = [
        'userId' => $user['id'],
        'exp' => $expires 
    ];

    // Encode the payload into a JWT using the defined secret key and HS256 algorithm
    $token = JWT::encode($payload, $SESSION_SECRET, 'HS256');

    // Set the generated JWT as an HTTP-only cookie for session management
    setcookie(
        'session_token',    // Cookie name
        $token,             // Cookie value (the JWT)
        [
            'expires' => $expires,  // Cookie expiration timestamp
            'path' => '/',          // Cookie is available across the entire domain
            'httponly' => true,     // Cookie is accessible only through HTTP requests, not JavaScript
            'samesite' => 'Lax',    // Restricts cross-site sending for security (Lax allows top-level navigations)
            'secure' => $_SERVER['HTTP_HOST'] !== 'localhost' // Cookie is sent only over HTTPS if not on localhost
        ]
    );

    ApiResponse::success('Logged in successfully, you\'ll be redirected shortly..', true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError('An error occurred during login. Please try again later.')->send(); 
}