<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

$RESET_SECRET = '765bdd7a336d24a41f64d023915735cf6164eedbee20bb1f6b57e96a13eb5502';

/**
 * Decodifica il JWT e restituisce lo user ID
 * @return int|false Restituce l'ID utente o false se non autenticato
 */
function getIdFromResetToken(string $resetToken): string | bool {
    if (empty(trim($resetToken))) {
        return false;
    }

    try {
        global $RESET_SECRET;
        $decoded = JWT::decode($resetToken, new Key($RESET_SECRET, 'HS256'));
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
