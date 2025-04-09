<?php
require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    DB::getInstance()
        ->setStatus(405)
        ->setResponse([
            'success' => false,
            'message' => 'Method not allowed',
            'body' => null
        ])
        ->send();
}

// Define type mapping
const TYPE_MAPPING = [
    ['relation' => 'vcardqrcodes', 'type' => 'vCards', 'alias' => 'v'],
    ['relation' => 'classicqrcodes', 'type' => 'classics', 'alias' => 'c']
];

$db = DB::getInstance();

try {
    // Session validation
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        $db->setStatus(401)
            ->setResponse([
                'success' => false,
                'message' => 'Unauthorized access',
                'body' => null
            ])
            ->send();
    }

    // Build SQL query
    $selectFields = [
        'q.id', 'q.name', 'q.userId', 'q.url', 
        'q.createdAt', 'q.updatedAt', 'q.scans',
        'v.firstName', 'v.lastName', 'v.phoneNumber', 
        'v.email', 'v.address', 'v.websiteUrl',
        'c.websiteUrl AS classicWebsite'
    ];

    $joins = [];
    foreach (TYPE_MAPPING as $mapping) {
        $joins[] = sprintf('LEFT JOIN %s %s ON q.id = %s.qrCodeId', 
                         $mapping['relation'], 
                         $mapping['alias'], 
                         $mapping['alias']);
    }

    $sql = sprintf(
        "SELECT %s FROM qrcodes q %s WHERE q.userId = ?",
        implode(', ', $selectFields),
        implode(' ', $joins)
    );

    // Execute query
    $qrCodes = $db->executeQuery($sql, [$userId]);

    if ($qrCodes === null) {
        throw new Exception('Failed to fetch QR codes');
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
                    if (!empty($qr['classicWebsite'])) { 
                        $type = $mapping['type'];
                        $relationData = [
                            'websiteUrl' => $qr['classicWebsite']
                        ];
                        break 2;
                    }
                    break;
            }
        }

        // Costruzione risultato
        $transformed[] = [
            'id' => (int)$qr['id'],
            'name' => $qr['name'],
            'userId' => (int)$qr['userId'],
            'url' => $qr['url'],
            'createdAt' => $qr['createdAt'],
            'updatedAt' => $qr['updatedAt'],
            'scans' => (int)$qr['scans'],
            'type' => $type,
            ...$relationData
        ];
    }

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'QR codes retrieved successfully',
            'body' => $transformed
        ])
        ->send();
} catch (Exception $e) {
    error_log($e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => 'Internal server error',
            'body' => null
        ])
        ->send();
}