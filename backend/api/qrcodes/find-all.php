<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';
require_once '../../lib/session.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

// Define type mapping
const TYPE_MAPPING = [
    ['relation' => 'vcard_qr_codes', 'type' => 'vCards', 'alias' => 'v'],
    ['relation' => 'classic_qr_codes', 'type' => 'classics', 'alias' => 'c']
];

$db = DB::getInstance();

try {
    // Session validation
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        ApiResponse::unauthorized()->send();
    }

    if (isBanned($userId)) {
        ApiResponse::forbidden("You are currently under a ban")->send();
    }

    // Build SQL query
    $selectFields = [
        'q.id', 'q.name', 'q.userId', 'q.url', 
        'q.createdAt', 'q.updatedAt', 'q.scans',
        'v.firstName', 'v.lastName', 'v.phoneNumber', 
        'v.email', 'v.address', 'v.websiteUrl',
        'c.targetUrl'
    ];

    $joins = [];
    foreach (TYPE_MAPPING as $mapping) {
        $joins[] = sprintf('LEFT JOIN %s %s ON q.id = %s.qrCodeId', 
                         $mapping['relation'], 
                         $mapping['alias'], 
                         $mapping['alias']);
    }

    $sql = sprintf(
        "SELECT %s FROM qr_codes q %s WHERE q.userId = ?",
        implode(', ', $selectFields),
        implode(' ', $joins)
    );

    // Execute query and fetch results
    $stmt = $db->execute($sql, [$userId]);
    if ($stmt === false) {
        throw new Exception('Failed to execute query');
    }

    $qrCodes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($qrCodes === null) {
        throw new Exception('No QR codes found for this user');
    }

    // Transform results
    $transformed = [];
    foreach ($qrCodes as $qr) {
        $type = 'unknown';
        $relationData = [];

        foreach (TYPE_MAPPING as $mapping) {
            $alias = $mapping['alias'];
            
            switch ($mapping['type']) {
                case 'vCards':
                    if (!empty($qr['firstName'])) { 
                        $type = $mapping['type'];
                        $relationData = [
                            'firstName' => $qr['firstName'],
                            'lastName' => $qr['lastName'],
                            'phoneNumber' => $qr['phoneNumber'],
                            'email' => $qr['email'],
                            'address' => $qr['address'],
                            'websiteUrl' => $qr['websiteUrl'] 
                        ];
                        break 2;
                    }
                    break;
                
                case 'classics':
                    if (!empty($qr['targetUrl'])) { 
                        $type = $mapping['type'];
                        $relationData = [
                            'targetUrl' => $qr['targetUrl']
                        ];
                        break 2;
                    }
                    break;
            }
        }

        $transformed[] = [
            'id' => (int)$qr['id'],
            'name' => $qr['name'],
            'url' => $qr['url'],
            'createdAt' => $qr['createdAt'],
            'updatedAt' => $qr['updatedAt'],
            'scans' => (int)$qr['scans'],
            'type' => $type,
            ...$relationData
        ];
    }

    ApiResponse::success('QR codes retrieved successfully', $transformed)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}