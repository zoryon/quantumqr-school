<?php

require_once "../../db/DB.php";
require_once "../../db/ApiResponse.php";

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
    if (!$user) {
        ApiResponse::clientError("User doesn't exists or is already banned")->send();
    }

    $insertedId = $db->insert("banned_users", [
        "userId" => $user["id"],
        "bannerAdminId" => $userId,
    ]);
    if (!$insertedId) {
        ApiResponse::internalServerError()->send();
    }

    ApiResponse::success("User banned successfully", $insertedId)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>