<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') ApiResponse::methodNotAllowed()->send();

try {
    $db = DB::getInstance();

    $tiers = $db->select("tiers");
    if ($tiers === null) ApiResponse::internalServerError()->send();

    ApiResponse::success('Tiers found successfully', $tiers)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}