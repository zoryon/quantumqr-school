<?php

require_once '../../vendor/autoload.php';

use SimpleSoftwareIO\QrCode\Generator;

$WEBSITE_URL = 'http://localhost:3000';
$ROUTER_URL = "$WEBSITE_URL/r";

function createVCardQR(int $userId, array $input)
{
    global $WEBSITE_URL;
    $db = DB::getInstance();

    // Validate required fields
    $required = ['name', 'firstName', 'lastName', 'phoneNumber', 'email', 'address', 'websiteUrl'];
    foreach ($required as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Check for existing QR code name
    $existing = $db->select("qrcodes", [
        "userId" => $userId, 
        "name" => $input['name']
    ]);

    if (!empty($existing)) {
        throw new Exception("A QR Code with the same name already exists");
    }

    // Start transaction
    $db->execute("START TRANSACTION");

    try {
        // 1. Insert base QR code record (without URL initially)
        $qrData = [
            'name' => trim($input['name']),
            'userId' => $userId,
            'url' => '' // Placeholder, will be updated later
        ];
        $qrId = $db->insert("qrcodes", $qrData); 

        if (!$qrId) {
            throw new Exception("Failed to insert base QR code record.");
        }

        // 2. Insert vCard specific details
        $vCardData = [
            'qrCodeId' => $qrId,
            'firstName' => trim($input['firstName']),
            'lastName' => trim($input['lastName']),
            'phoneNumber' => trim($input['phoneNumber']),
            'email' => trim($input['email']),
            'address' => trim($input['address']),
            'websiteUrl' => trim($input['websiteUrl'])
        ];
        $db->insert("vcardqrcodes", $vCardData);

        // Instantiate the QrCode Generator class
        $qrCode = new Generator();

        // --- Generate QR Code SVG ---
        $dynamicUrl = "$WEBSITE_URL/q/vcards/$qrId";

        // Generate QR code with logo using simplesoftwareio/simple-qrcode
        $fgColor = $input['fgColor'] ?? '#000000';
        $bgColor = $input['bgColor'] ?? '#ffffff';
        $base64Logo = $input['logo'] ?? null;
        $logoScale = $input['logoScale'] ?? 0.2;

        if ($base64Logo && !isValidBase64Image($base64Logo)) {
            throw new Exception("Logo should be under 300KB and in PNG or JPG format.");
        }

        $qrCode->format('svg')
            ->size(300)
            ->errorCorrection('H')
            ->color(hexToRgbComponents($fgColor)[0], hexToRgbComponents($fgColor)[1], hexToRgbComponents($fgColor)[2])
            ->backgroundColor(hexToRgbComponents($bgColor)[0], hexToRgbComponents($bgColor)[1], hexToRgbComponents($bgColor)[2]);
        $qrCodeSvg = $qrCode->generate($dynamicUrl);

        if ($base64Logo) {
            $qrCodeSvg = addLogoToSvgQrCode($qrCodeSvg, $base64Logo, $logoScale);
        }

        // 3. Update the base QR code record with the generated SVG URL/content
        $updateResult = $db->update("qrcodes", ['url' => $qrCodeSvg], ['id' => $qrId]);

        if ($updateResult === false) { // update returns row count or false
            throw new Exception("Failed to update QR code record with generated SVG for ID: $qrId");
        }

        // --- Commit Transaction ---
        $db->execute("COMMIT");
    } catch (Exception $e) {
        $db->execute("ROLLBACK");
        throw $e;
    }

    return getQRCodeDetails($qrId);
}

function createClassicQR(int $userId, array $input)
{
    global $ROUTER_URL;
    $db = DB::getInstance();

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

    // --- Check for existing QR code name ---
    $existing = $db->select("qrcodes", [
        "userId" => $userId,
        "name" => $input['name']
    ]);

    if (!empty($existing)) {
        throw new Exception("A QR Code with the same name already exists");
    }

    // --- Database Operations (Transaction) ---
    $db->execute("START TRANSACTION");

    try {
        // 1. Insert base QR code record
        $qrData = [
            'name' => trim($input['name']),
            'userId' => $userId,
            'url' => '' // Placeholder
        ];
        $qrId = $db->insert("qrcodes", $qrData);

        if (!$qrId) {
            throw new Exception("Failed to insert base QR code record.");
        }

        // 2. Insert classic QR specific details
        $classicData = [
            'qrCodeId' => $qrId,
            'websiteUrl' => trim($input['websiteUrl'])
        ];
        $db->insert("classicqrcodes", $classicData);

        // --- Generate QR Code SVG ---
        // Generate QR URL
        $dynamicUrl = "$ROUTER_URL/classics/$qrId";

        // Instantiate the QrCode Generator class
        $qrCode = new Generator();

        // Generate QR code with logo using simplesoftwareio/simple-qrcode
        $fgColor = $input['fgColor'] ?? '#000000';
        $bgColor = $input['bgColor'] ?? '#ffffff';
        $base64Logo = $input['logo'] ?? null;
        $logoScale = $input['logoScale'] ?? 0.2; // Convert percentage to fraction

        if ($base64Logo && !isValidBase64Image($base64Logo)) {
            throw new Exception("Logo should be under 300KB and in PNG or JPG format.");
        }

        $qrCode->format('svg')
            ->size(300)
            ->errorCorrection('H')
            ->color(hexToRgbComponents($fgColor)[0], hexToRgbComponents($fgColor)[1], hexToRgbComponents($fgColor)[2])
            ->backgroundColor(hexToRgbComponents($bgColor)[0], hexToRgbComponents($bgColor)[1], hexToRgbComponents($bgColor)[2]);
        $qrCodeSvg = $qrCode->generate($dynamicUrl);

        if ($base64Logo) {
            $qrCodeSvg = addLogoToSvgQrCode($qrCodeSvg, $base64Logo, $logoScale);
        }

        // 3. Update the base QR code record with the generated SVG
        $updateResult = $db->update("qrcodes", ['url' => $qrCodeSvg], ['id' => $qrId]);

        if ($updateResult === false) {
            throw new Exception("Failed to update QR code record with generated SVG for ID: $qrId");
        }

        $db->execute("COMMIT");
    } catch (Exception $e) {
        $db->execute("ROLLBACK");
        throw $e;
    }

    return getQRCodeDetails($qrId);
}

function getQRCodeDetails(int $qrId)
{
    $db = DB::getInstance();

    $sql = "SELECT q.*, v.*, c.*
        FROM qrcodes AS q
        LEFT JOIN vcardqrcodes AS v ON q.id = v.qrCodeId
        LEFT JOIN classicqrcodes AS c ON q.id = c.qrCodeId
        WHERE q.id = ?";

    try {
        $stmt = $db->execute($sql, [$qrId]);

        if ($stmt) {
            // Fetch the single result row
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null; 
        } else {
            return null;
        }
    } catch (Exception $e) {
        return null;
    }
}

// ================
// Helper Functions 
// ================

function hexToRgbComponents($hex)
{
    $hex = ltrim($hex, '#');
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    return [$r, $g, $b];
}

function addLogoToSvgQrCode(string $svgContent, string $base64Logo, float $logoScale = 0.2): string {
    $doc = new DOMDocument();
    $doc->loadXML($svgContent);
    $doc->preserveWhiteSpace = false;

    $svg = $doc->documentElement;

    // Extract viewBox or fallback to default size
    $viewBox = $svg->getAttribute('viewBox');
    $size = 300;
    if ($viewBox) {
        $parts = explode(' ', $viewBox);
        $size = isset($parts[2]) ? (int)$parts[2] : $size;
    }

    $logoSize = $size * $logoScale;
    $x = ($size - $logoSize) / 2;
    $y = ($size - $logoSize) / 2;

    // Add white background behind logo for clarity (optional but recommended)
    $background = $doc->createElementNS('http://www.w3.org/2000/svg', 'rect');
    $background->setAttribute('x', $x);
    $background->setAttribute('y', $y);
    $background->setAttribute('width', $logoSize);
    $background->setAttribute('height', $logoSize);
    $background->setAttribute('fill', '#FFFFFF');
    $background->setAttribute('rx', $logoSize * 0.1); // rounded corners

    // Create image element
    $image = $doc->createElementNS('http://www.w3.org/2000/svg', 'image');
    $image->setAttribute('x', $x);
    $image->setAttribute('y', $y);
    $image->setAttribute('width', $logoSize);
    $image->setAttribute('height', $logoSize);
    $image->setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', $base64Logo);

    // Insert background and image at the end so they appear on top
    $svg->appendChild($background);
    $svg->appendChild($image);

    return $doc->saveXML($svg);
}

function isValidBase64Image(string $base64, int $maxSizeKb = 300): bool {
    // Verifica se inizia correttamente
    if (!preg_match('/^data:image\/(png|jpeg|jpg|gif);base64,/', $base64)) {
        return false;
    }

    // Calcola la dimensione in byte (base64 è circa 33% più grande)
    $data = explode(',', $base64)[1] ?? '';
    $sizeInBytes = (int)(strlen($data) * 0.75);

    return $sizeInBytes <= ($maxSizeKb * 1024);
}