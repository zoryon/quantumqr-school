<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') ApiResponse::methodNotAllowed()->send();

$db = DB::getInstance();

try {
    // Check for an existing session and get the user ID
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? ''); 
    if (!$userId) ApiResponse::unauthorized('You are not logged in or your session has expired')->send();
    if (isBanned($userId)) ApiResponse::forbidden("You are currently under a ban")->send();

    // Select user details from active_users, join with subscriptions and tiers to get tier name.
    // Using subqueries to count QR codes and sum their scans for this user.
    // Using SUM returns null if there are no scans, COALESCE make so it returns 0 instead
    $query = "SELECT u.*, t.name AS tier,
              (SELECT COUNT(*) FROM qr_codes WHERE userId = u.id) AS qrCodesCount,
              (SELECT COALESCE(SUM(scans), 0) FROM qr_codes WHERE userId = u.id) AS totalScans
           FROM active_users AS u
           JOIN subscriptions s ON u.id = s.userId
           JOIN tiers t ON s.tierId = t.id
           WHERE u.id = ?"; // Filter by the current user's ID

    $stmt = $db->execute($query, [$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData || empty($userData)) ApiResponse::notFound('User data not found')->send(); 

    ApiResponse::success('User data retrieved successfully', $userData)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}