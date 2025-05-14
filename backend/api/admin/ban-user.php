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

    // Validate input: ensure the 'banId' key is present
    if (!isset($input["banId"])) ApiResponse::clientError("Must select a user id to ban")->send();

    // Find the user to be ban in the active_users table by email
    $user = $db->selectOne("active_users", ["id" => $input["banId"]]);
    if ($user === null) ApiResponse::clientError("User doesn't exists or is already banned")->send();

    // Insert a new record into the banned_users table
    $success = $db->insert("banned_users", [
        "userId" => $input["banId"],    // The ID of the user being banned
        "bannerAdminId" => $userId,     // The ID of the admin performing the ban
    ]);
    // Handle database insertion failure
    if ($success === null) ApiResponse::internalServerError()->send(); 

    ApiResponse::success("User banned successfully", true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>