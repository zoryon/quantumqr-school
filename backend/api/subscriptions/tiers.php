<?php

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') ApiResponse::methodNotAllowed()->send();

try {
    $db = DB::getInstance();

    $tiers = $db->select("tiers");
    if ($tiers === null) ApiResponse::internalServerError()->send();

    ApiResponse::success('Tiers found successfully', $tiers)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}