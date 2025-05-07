<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

try {
    $db = DB::getInstance();

    $tiers = $db->select("tiers");

    ApiResponse::success('Tiers found successfully', $tiers)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}