<?php
session_start();
if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../db/connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing order ID']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Update the order header
    $stmt = $pdo->prepare("
        UPDATE orders
        SET
            beeper_number  = ?,
            order_type     = ?,
            payment_method = ?,
            amount_paid    = ?,
            subtotal       = ?,
            discount       = ?,
            total          = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $data['beeper_number'],
        $data['order_type'],
        $data['payment_method'],
        $data['amount_paid']  ?? $data['total'],
        $data['subtotal']     ?? $data['total'],
        $data['discount']     ?? 0,
        $data['total'],
        $data['order_id'],
    ]);

    // Replace order items if provided
    if (!empty($data['items'])) {
        // Delete old items
        $del = $pdo->prepare("DELETE FROM order_items WHERE order_id = ?");
        $del->execute([$data['order_id']]);

        // Insert new items
        $ins = $pdo->prepare("
            INSERT INTO order_items (order_id, menu_item_id, name, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        ");
        foreach ($data['items'] as $item) {
            $ins->execute([
                $data['order_id'],
                $item['id'],
                $item['name'],
                $item['price'],
                $item['qty'],
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}