<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        ApiResponse::notFound()->send();
    }

    $subscription = $db->selectOne("subscriptions", [
        "userId" => $userId,
        "canceledAt" => null
    ]);

    $input = json_decode(file_get_contents('php://input'), true);

    if ($input === null || !isset($input['id']) || !is_numeric($input['id'])) {
        ApiResponse::clientError('Invalid input. Expecting JSON object with a numeric "id"')->send();
    }

    if ($subscription["tierId"] === $input["id"]) {
        ApiResponse::clientError('You already have this tier')->send();
    }

    $newTierId = (int)$input['id'];

    $newTier = $db->selectOne("tiers", ["id" => $newTierId]);
    if (!$newTier) {
        ApiResponse::notFound('The selected subscription tier does not exist')->send();
    }

    $affectedRows = $db->update("subscriptions", ["tierId" => $newTierId], ["id" => $subscription["id"]]);

    ApiResponse::success('Tier changed successfully', $affectedRows)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
