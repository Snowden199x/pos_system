<?php

require_once __DIR__ . '/../../db/connection.php';

$data = json_decode(file_get_contents("php://input"), true);

try {

    $stmt = $pdo->prepare("
        DELETE FROM order_items
        WHERE order_id = ?
    ");

    $stmt->execute([
        $data['order_id']
    ]);

    $stmt = $pdo->prepare("
        DELETE FROM orders
        WHERE id = ?
    ");

    $stmt->execute([
        $data['order_id']
    ]);

    echo json_encode([
        'success' => true
    ]);

} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}