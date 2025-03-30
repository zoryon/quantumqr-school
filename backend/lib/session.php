<?php

// MUST REQUIRE: require_once '../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

/**
 * Decodifica il JWT e restituisce lo user ID
 * @return int|false Restituce l'ID utente o false se non autenticato
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
        // Token scaduto
        return false;
    } catch (SignatureInvalidException $e) {
        // Firma non valida
        return false;
    } catch (Exception $e) {
        return false;
    }
}

// Funzione per verificare il login
function isLoggedIn(string $sessionToken): bool {
    return getIdFromSessionToken($sessionToken) !== false;
}
