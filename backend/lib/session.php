<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../db/DB.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

/**
 * Decrypt the JWT and return the user's ID
 * @return int|false Return user's ID or false if not authenticated
 */
function getIdFromSessionToken(string $sessionToken): string | bool {
    if (empty(trim($sessionToken))) {
        return false;
    }

    try {
        global $SESSION_SECRET;
        $decoded = JWT::decode($sessionToken, new Key($SESSION_SECRET, 'HS256'));
        return $decoded->userId;
    } catch (ExpiredException $e) {
        return false;
    } catch (SignatureInvalidException $e) {
        return false;
    } catch (Exception $e) {
        return false;
    }
}

// Verify if current users is logged in or not
function isLoggedIn(string $sessionToken): bool {
    return getIdFromSessionToken($sessionToken) !== false;
}

function isBanned(int $id): bool {
    $db = DB::getInstance();

    $user = $db->selectOne("banned_users", ["id" => $id]);

    return $user ? true : false;
}