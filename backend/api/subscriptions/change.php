<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if (!$userId) ApiResponse::unauthorized('You are not logged in or your session has expired')->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Retrieve the user's current active subscription
    $subscription = $db->selectOne("subscriptions", [
        "userId" => $userId,
        "canceledAt" => null // Subscription which haven't been canceled
    ]);

    // Get and decode input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Check if input is valid JSON and contains a numeric 'id' (new tier ID)
    if ($input === null || !isset($input['id']) || !is_numeric($input['id'])) ApiResponse::clientError('Invalid input. Expecting object with a numeric "id"')->send();

    // Check if the user is already subscribed to the requested tier
    if ($subscription && $subscription["tierId"] === (int)$input["id"]) ApiResponse::clientError('You already have the selected subscription tier')->send();

    $newTierId = (int)$input['id'];

    // Verify that the requested new tier exists in the 'tiers' table
    $newTier = $db->selectOne("tiers", ["id" => $newTierId]);
    if ($newTier === null) ApiResponse::notFound('The selected subscription tier does not exist')->send();

    // Update the user's current subscription record with the new tier ID
    $affectedRows = $db->update("subscriptions", ["tierId" => $newTierId], ["id" => $subscription["id"]]);

    ApiResponse::success('Subscription tier changed successfully', $affectedRows)->send(); 
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}