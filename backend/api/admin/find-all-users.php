<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== "GET") ApiResponse::methodNotAllowed()->send();

try {
    $db = DB::getInstance();

    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) ApiResponse::notFound()->send(); 

    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Check if the current session user has the ADMIN role
    $currentUser = $db->selectOne("active_users", [
        "id" => $userId,
        "role" => UserRole::ADMIN->value 
    ]);
    // If the user is not found or is not an admin, deny access
    if ($currentUser === null) {
        ApiResponse::notFound()->send(); 
    }

    $sql = "SELECT u.*, t.name AS tier,
              (SELECT COUNT(*) FROM qr_codes WHERE userId = u.id) AS qrCodesCount,
              (SELECT COALESCE(SUM(scans), 0) FROM qr_codes WHERE userId = u.id) AS totalScans
           FROM active_users AS u
           JOIN subscriptions s ON u.id = s.userId
           JOIN tiers t ON s.tierId = t.id
           WHERE u.role = ?";

    // Select all users from the active_users table where the role is USER
    $stmt = $db->execute($sql, [UserRole::USER->value]);
    if ($stmt === false) ApiResponse::internalServerError()->send(); 

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ApiResponse::success('User list found successfully', $users)->send();
} catch(Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}
?>