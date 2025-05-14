<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== "GET") ApiResponse::methodNotAllowed()->send();

try {
    // Get the user ID from the session token in the cookie
    $userId = getIdFromSessionToken($_COOKIE["session_token"]);
    if (!$userId) ApiResponse::notFound()->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    $db = DB::getInstance();

    // Get and decode the JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Check if user is an admin
    $user = $db->selectOne("active_users", [
        "id" => $userId,
        "role" => UserRole::ADMIN->value,
    ]);
    if ($user === null) ApiResponse::notFound()->send();

    /*
     * Calculate app stats such as:
     * - Number of current user (banned users count as well)
     * - Number of pending promotion requests (WHERE reviewedAt IS NULL)
     */
    $sql = "SELECT
            (SELECT COUNT(*) FROM users) AS usersCount,
            (SELECT COUNT(*) FROM promotion_requests WHERE reviewedAt IS NULL) AS pendingReviewsCount";
    $stmt = $db->execute($sql);
    $result = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

    if ($result === null) ApiResponse::internalServerError()->send(); 

    ApiResponse::success("Stats were calculated successfully", $result)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>