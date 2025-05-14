<?php

// Auto-load classes 
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . "/db/DB.php";
require_once __DIR__ . "/db/ApiResponse.php";
require_once __DIR__ . "/lib/session.php";

// Global error handlers
set_exception_handler(function (Throwable $e) {
    error_log("Uncaught Exception: " . $e->getMessage());
    ApiResponse::internalServerError("Internal Server Error: " . $e->getMessage())->send();
});

set_error_handler(function ($severity, $message, $file, $line) {
    error_log("Error: $message in $file on line $line");
    ApiResponse::internalServerError("Internal Server Error: $message")->send();
});
