<?php

require_once '../../vendor/autoload.php';

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

$WEBSITE_URL = 'http://localhost:3000';
$ROUTER_URL = "$WEBSITE_URL/r";
$db = DB::getInstance();

function createVCardQR(int $userId, array $input) {
    global $WEBSITE_URL;
    global $db;
    
    // Validate required fields
    $required = ['name', 'firstName', 'lastName', 'phoneNumber', 'email', 'address', 'websiteUrl'];
    foreach ($required as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Check for existing QR code name
    $existing = $db->executeQuery(
        "SELECT id FROM qrcodes WHERE userId = ? AND name = ?",
        [$userId, $input['name']]
    );
    
    if (!empty($existing)) {
        throw new Exception("A QR Code with the same name already exists");
    }

    // Start transaction
    $db->executeQuery("START TRANSACTION");

    try {
        // Insert main QR code
        $qrId = $db->insert(
            "INSERT INTO qrcodes (name, userId, url) VALUES (?, ?, '')",
            [$input['name'], $userId]
        );

        // Insert vCard details
        $db->insert(
            "INSERT INTO vcardqrcodes 
            (qrCodeId, firstName, lastName, phoneNumber, email, address, websiteUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                $qrId,
                $input['firstName'],
                $input['lastName'],
                $input['phoneNumber'],
                $input['email'],
                $input['address'],
                $input['websiteUrl']
            ]
        );

        // Get QR Code's design
        $fgColor = isset($input['fgColor']) ? $input['fgColor'] : '#000000';
        $bgColor = isset($input['bgColor']) ? $input['bgColor'] : '#FFFFFF';
        $logo = isset($input['logo']) ? $input['logo'] : null;
        $logoSize = isset($input['logoSize']) ? $input['logoSize'] : 20;

        // Generate QR URL
        $dynamicUrl = "$WEBSITE_URL/q/vcards/$qrId";

        $qrCode = new QRCode();
        $qrCode->setOptions(new QROptions([
            'version' => 5,
            'eccLevel' => QRCode::ECC_L,  // Error correction level
            'fgColor' => hexToRgb($fgColor),  // Black color in rgb
            'bgColor' => hexToRgb($bgColor)  // White color in rgb
        ]));
        $qrCodeUrl = ($qrCode)->render($dynamicUrl);

        // Update QR code with generated URL
        $db->update(
            "UPDATE qrcodes SET url = ? WHERE id = ?",
            [$qrCodeUrl, $qrId]
        );

        $db->executeQuery("COMMIT");
    } catch (Exception $e) {
        $db->executeQuery("ROLLBACK");
        throw $e;
    }

    return getQRCodeDetails($qrId);
}

function createClassicQR(int $userId, array $input) {
    global $db;
    global $ROUTER_URL;
    
    // Validate required fields
    $required = ['name', 'websiteUrl'];
    foreach ($required as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Validate website URL
    if (empty(trim($input['websiteUrl'] ?? ''))) {
        throw new Exception("Website URL is required");
    }

    // Check for existing QR code name
    $existing = $db->executeQuery(
        "SELECT id FROM qrcodes WHERE userId = ? AND name = ?",
        [$userId, $input['name']]
    );
    
    if (!empty($existing)) {
        throw new Exception("A QR Code with the same name already exists");
    }

    // Start transaction
    $db->executeQuery("START TRANSACTION");

    try {
        // Insert main QR code
        $qrId = $db->insert(
            "INSERT INTO qrcodes (name, userId, url) VALUES (?, ?, '')",
            [$input['name'], $userId]
        );

        // Insert classic details
        $db->insert(
            "INSERT INTO classicqrcodes (qrCodeId, websiteUrl) VALUES (?, ?)",
            [$qrId, $input['websiteUrl']]
        );

        // Generate QR URL
        $url = "$ROUTER_URL/classics/$qrId";
        $qrCodeUrl = (new QRCode())->render($url);

        // Update QR code
        $db->update(
            "UPDATE qrcodes SET url = ? WHERE id = ?",
            [$qrCodeUrl, $qrId]
        );

        $db->executeQuery("COMMIT");
    } catch (Exception $e) {
        $db->executeQuery("ROLLBACK");
        throw $e;
    }

    return getQRCodeDetails($qrId);
}

function getQRCodeDetails(int $qrId) {
    global $db;

    $qrCode = $db->executeQuery(
        "SELECT q.*, v.*, c.* 
        FROM qrcodes AS q
        LEFT JOIN vcardqrcodes AS v ON q.id = v.qrCodeId
        LEFT JOIN classicqrcodes AS c ON q.id = c.qrCodeId
        WHERE q.id = ?",
        [$qrId]
    );
    
    return $qrCode[0] ?? null;
}

// Utils
function hexToRgb($hex) {
    $hex = ltrim($hex, '#');
    $length = strlen($hex);
    if ($length !== 3 && $length !== 6) {
        throw new InvalidArgumentException("Invalid color code: $hex");
    }
    if ($length === 3) {
        $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    }
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    return [$r, $g, $b];
}