<?php

require_once "../../db/DB.php";
require_once "../../db/ApiResponse.php";
require_once "../../lib/session.php";

if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    ApiResponse::methodNotAllowed()->send();
}

try {
    $userId = getIdFromSessionToken($_COOKIE["session_token"]);
    if (!$userId) {
        ApiResponse::notFound()->send();
    }

    if (isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
    }

    $db = DB::getInstance();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input["banEmail"])) {
        ApiResponse::clientError("Must select a user email to ban")->send();
    }

    $user = $db->selectOne("active_users", ["email" => $input["banEmail"]]);
    if ($user === null) {
        ApiResponse::clientError("User doesn't exists or is already banned")->send();
    }

    $success = $db->insert("banned_users", [
        "userId" => $user["id"],
        "bannerAdminId" => $userId,
    ]);
    if ($success === null) {
        ApiResponse::internalServerError()->send();
    }

    ApiResponse::success("User banned successfully", true)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>