<?php
// Guard: must be accessed through index.php
if (!isset($_SESSION["logged_in"])) {
    header("Location: ../../index.php");
    exit();
}

$base_url = '/Github/POS_SYSTEM/';
$current_page = isset($_GET['page']) ? $_GET['page'] : 'home';

require_once __DIR__ . '/../../db/connection.php';
$stmt = $pdo->query("SELECT * FROM menu_items");
$menu_items = $stmt->fetchAll(PDO::FETCH_ASSOC); [
    ['id' => 1, 'name' => 'Eruption',          'price' => 229, 'category' => 'sushi', 'image' => 'assets/images/eruption.png'],
    ['id' => 2, 'name' => 'Cheesy Shrimp Bomb', 'price' => 169, 'category' => 'sushi', 'image' => 'assets/images/cheesyshrimp.png'],
    ['id' => 3, 'name' => 'Crazy Crab',          'price' => 158, 'category' => 'sushi', 'image' => 'assets/images/crazycrab.png'],
    ['id' => 4, 'name' => 'Tori Floss Maki',     'price' => 149, 'category' => 'sushi', 'image' => 'assets/images/torifloss.png'],
    ['id' => 5, 'name' => 'Ebi Tempura Roll',    'price' => 149, 'category' => 'sushi', 'image' => 'assets/images/ebitemp.png'],
    ['id' => 6, 'name' => 'Mango Craze',         'price' => 139, 'category' => 'sushi', 'image' => 'assets/images/mangocraze.png'],
    ['id' => 7, 'name' => 'Carbonara',           'price' => 185, 'category' => 'pasta', 'image' => 'assets/images/carbonara.png'],
    ['id' => 8, 'name' => 'Bolognese',           'price' => 175, 'category' => 'pasta', 'image' => 'assets/images/bolognese.png'],
    ['id' => 9, 'name' => 'Aglio e Olio',        'price' => 155, 'category' => 'pasta', 'image' => 'assets/images/aglio-olio.png'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twist &amp; Roll POS</title>
    <link rel="stylesheet" href="<?= $base_url ?>assets/index.css">
    <link rel="stylesheet" href="<?= $base_url ?>modules/homepage/homepage.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<!-- TOP NAVBAR -->
<header class="navbar">
    <img src="<?= $base_url ?>assets/images/logo.png" alt="Twist &amp; Roll" class="navbar__logo-img">

    <nav class="navbar__nav">
        <a href="index.php?page=home"       class="nav-link <?= $current_page === 'home'       ? 'nav-link--active' : '' ?>">Home</a>
        <a href="index.php?page=orders"     class="nav-link <?= $current_page === 'orders'     ? 'nav-link--active' : '' ?>">Orders</a>
        <a href="index.php?page=served"     class="nav-link <?= $current_page === 'served'     ? 'nav-link--active' : '' ?>">Served</a>
        <a href="index.php?page=statistics" class="nav-link <?= $current_page === 'statistics' ? 'nav-link--active' : '' ?>">Statistics</a>
    </nav>

    <div class="navbar__datetime">
        <div class="navbar__day"  id="current-day">Wednesday</div>
        <div class="navbar__date" id="current-date">April 22, 2026 at 05:32 PM</div>
    </div>
</header>

<!-- MAIN CONTENT -->
<main class="pos-layout">

    <!-- LEFT PANEL: MENU -->
    <section class="menu-panel">
        <h2 class="menu-panel__title">Menu</h2>

        <div class="category-filters">
            <button class="filter-btn filter-btn--active" data-category="all">All</button>
            <button class="filter-btn" data-category="sushi">Sushi</button>
            <button class="filter-btn" data-category="pasta">Pasta</button>
        </div>

        <div class="menu-grid" id="menu-grid">
            <?php foreach ($menu_items as $item): ?>
            <div class="menu-card"
                 data-id="<?= $item['id'] ?>"
                 data-name="<?= htmlspecialchars($item['name']) ?>"
                 data-price="<?= $item['price'] ?>"
                 data-category="<?= $item['category'] ?>">
                <div class="menu-card__image-wrap">
                    <img src="<?= $base_url . htmlspecialchars($item['image']) ?>"
                         alt="<?= htmlspecialchars($item['name']) ?>"
                         class="menu-card__image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="menu-card__image-placeholder" style="display:none;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>
                </div>
                <div class="menu-card__info">
                    <span class="menu-card__name"><?= htmlspecialchars($item['name']) ?></span>
                    <span class="menu-card__price">Php <?= number_format($item['price']) ?></span>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- RIGHT PANEL: ORDER -->
    <aside class="order-panel">
        <div class="order-panel__type">
            <button class="type-btn type-btn--active" data-type="dine-in">Dine in</button>
            <button class="type-btn" data-type="take-out">Take out</button>
        </div>

        <div class="order-panel__beeper">
            <label class="beeper-label">Beeper #</label>
            <input type="number" class="beeper-input" id="beeper-input" min="1" placeholder="1">
        </div>

        <div class="order-items-section">
            <p class="order-items-label">ORDER ITEMS</p>
            <div class="order-items-list" id="order-items-list">
                <div class="order-empty" id="order-empty">
                    <svg class="order-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span class="order-empty__text">No items yet</span>
                    <span class="order-empty__sub">Tap menu items to add</span>
                </div>
            </div>
        </div>

        <div class="payment-summary">
            <p class="payment-summary__title">PAYMENT SUMMARY</p>
            <div class="payment-summary__row">
                <span>Discount</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="discount-toggle">
                    <span class="toggle-slider"></span>
                </label>
                <span class="discount-value" id="discount-value">Php 0</span>
            </div>
            <div class="payment-summary__row">
                <span>Subtotal</span>
                <span id="subtotal-value">Php 0.00</span>
            </div>
            <div class="payment-summary__divider"></div>
            <div class="payment-summary__total">
                <span>Total</span>
                <span class="total-amount" id="total-value">Php 0.00</span>
            </div>
        </div>

        <div class="payment-methods">
            <button class="payment-btn payment-btn--active" data-method="cash">Cash</button>
            <button class="payment-btn" data-method="gcash">Gcash</button>
        </div>

        <div class="amount-input-wrap">
            <input type="number" class="amount-input" id="amount-input" placeholder="Php 0.00" step="0.01" min="0">
        </div>

        <button class="place-order-btn" id="place-order-btn">
            Place order – Php 0.00
        </button>
    </aside>

</main>

<script src="<?= $base_url ?>assets/js/main.js"></script>
<script src="<?= $base_url ?>modules/homepage/homepage.js"></script>
</body>
</html>