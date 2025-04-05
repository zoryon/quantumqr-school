<?php

use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Logo\Logo;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\SvgWriter;

require_once '../../vendor/autoload.php';

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

        // Generate QR URL
        $dynamicUrl = "$WEBSITE_URL/q/vcards/$qrId";

        $qrCodeUrl = generateQRCodeSvg($dynamicUrl, $input);

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

        $qrCodeUrl = generateQRCodeSvg($url, $input);

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
function generateQRCodeSvg($dynamicUrl, array $input) {
    try {
        $writer = new SvgWriter();

        // Get QR Code's design
        $fgColor = $input['fgColor'] ?? '#000000';
        $bgColor = $input['bgColor'] ?? '#ffffff';
        $base64Logo = $input['logo'] ?? null;
        $logoSize = $input['logoSize'] ?? 20;
    
        $qrCode = new QRCode(
            data: $dynamicUrl,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::Low,
            size: 300,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: hexToRgb($fgColor),
            backgroundColor: hexToRgb($bgColor)
        );
    
        if($base64Logo === null || !$base64Logo) {
            return ($writer->write($qrCode))->getString();
        } else {
            $logo = new Logo(
                path: $base64Logo,
                resizeToWidth: $logoSize,
            );
            
            return ($writer->write($qrCode, $logo))->getString();
        }
    } catch (Exception $e) {
        throw new Exception("Error generating QR code: " . $e->getMessage());
    }
}

function hexToRgb($hex): Color {
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
    return new Color($r, $g, $b);
}