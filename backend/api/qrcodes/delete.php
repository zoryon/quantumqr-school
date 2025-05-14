<?php

require_once __DIR__ . "/../../bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE["session_token"] ?? "");
    if (!$userId) ApiResponse::unauthorized("You are not logged in or your session has expired")->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents("php://input"), true);

    // Validate input: ensure "ids" is present and is an array
    if (!isset($input["ids"]) || !is_array($input["ids"])) {
        ApiResponse::clientError("Missing or invalid QR code IDs in request body. Expected an array of IDs under the key 'ids'")->send();
    }

    $qrIds = [];
    // Validate each ID in the array
    foreach ($input["ids"] as $id) {
        $qrId = (int)$id;
        if ($qrId <= 0) {
            ApiResponse::clientError("Invalid QR code ID provided: $id. IDs must be positive integers.")->send();
        }
        $qrIds[] = $qrId; // Collect valid integer IDs
    }

    // Ensure there"s at least one valid ID to process
    if (empty($qrIds)) {
        ApiResponse::clientError("No valid QR code IDs provided in the array")->send();
    }

    // Build the WHERE IN clause dynamically for the IDs
    $inPlaceholder = implode(",", array_fill(0, count($qrIds), "?")); 
    $sql = "DELETE FROM qr_codes WHERE id IN ($inPlaceholder) AND userId = ?";

    // Prepare the parameters for binding
    // The order matters: all QR IDs first, then the userId
    $params = array_merge($qrIds, [$userId]);

    // Execute the query
    $stmt = $db->execute($sql, $params);

    if ($stmt === false) {
        ApiResponse::internalServerError("Database query execution failed during deletion.")->send();
    }

    $affectedRows = $stmt->rowCount();

    // Check the number of rows affected by the delete operation
    if ($affectedRows === 0) {
        ApiResponse::success("No matching QR codes found for deletion or you do not have permission for the provided IDs", 0)->send();
    } else {
        ApiResponse::success("$affectedRows QR code(s) deleted successfully", $affectedRows)->send();
    }
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}