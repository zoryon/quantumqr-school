<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== "POST") ApiResponse::methodNotAllowed()->send();

try {
    // Get the user ID from the session token in the cookie
    $userId = getIdFromSessionToken($_COOKIE["session_token"]);
    if (!$userId) ApiResponse::notFound()->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    $db = DB::getInstance();

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Ensure the 'username' key is present
    if (!isset($input["username"]) || empty($input["username"])) ApiResponse::clientError(message: "New username is missing")->send();
    if (strlen($input["username"]) > 20) ApiResponse::clientError("Username must be equal or less than 20 characters")->send();

    // Find the user to be ban in the active_users table by email
    $affectedRows = $db->update("users", ["username" => $input["username"]], ["id" => $userId]);
    if ($affectedRows === null || $affectedRows !== 1) ApiResponse::clientError("User doesn't exists or is banned")->send();
    
    ApiResponse::success("Changed name successfully", true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>