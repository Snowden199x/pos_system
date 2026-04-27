<?php
if (!isset($_SESSION["logged_in"])) {
    header("Location: ../../index.php");
    exit();
}

$base_url = '/Github/POS_SYSTEM/';
$current_page = $_GET['page'] ?? 'orders';

$orders = [
  [
    "id"=>1,
    "type"=>"dine",
    "payment"=>"Cash",
    "discount"=>0,
    "time"=>"03:10 PM",
    "items"=>[
      ["name"=>"Eruption","price"=>229]
    ]
  ],
  [
    "id"=>2,
    "type"=>"dine",
    "payment"=>"GCash",
    "discount"=>20,
    "time"=>"03:20 PM",
    "items"=>[
      ["name"=>"Eruption","price"=>229],
      ["name"=>"Mango Craze","price"=>139],
      ["name"=>"Cheesy Shrimp Bomb","price"=>169],
      ["name"=>"Crazy Crab","price"=>159]
    ]
  ],
  [
    "id"=>3,
    "type"=>"takeout",
    "payment"=>"Cash",
    "discount"=>0,
    "time"=>"03:35 PM",
    "items"=>[
      ["name"=>"Crazy Crab","price"=>159],
      ["name"=>"Eruption","price"=>229]
    ]
  ],
  [
    "id"=>4,
    "type"=>"dine",
    "payment"=>"GCash",
    "discount"=>20,
    "time"=>"03:40 PM",
    "items"=>[
      ["name"=>"Eruption","price"=>229]
    ]
  ]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Orders</title>

<link rel="stylesheet" href="<?= $base_url ?>assets/index.css">
<link rel="stylesheet" href="<?= $base_url ?>modules/homepage/homepage.css">
<link rel="stylesheet" href="<?= $base_url ?>modules/orders/orders.css">
</head>

<body>

<header class="navbar">
    <img src="<?= $base_url ?>assets/images/logo.png" class="navbar__logo-img">

    <nav class="navbar__nav">
        <a href="index.php?page=home" class="nav-link <?= $current_page==='home'?'nav-link--active':'' ?>">Home</a>
        <a href="index.php?page=orders" class="nav-link <?= $current_page==='orders'?'nav-link--active':'' ?>">Orders</a>
        <a href="index.php?page=served" class="nav-link">Served</a>
        <a href="index.php?page=statistics" class="nav-link">Statistics</a>
    </nav>

    <div class="navbar__right">
        <div class="navbar__datetime">
            <div id="current-day" class="navbar__day"></div>
            <div id="current-date" class="navbar__date"></div>
        </div>

        <div class="profile-menu">
            <button id="profile-btn" class="profile-btn">
                <img src="<?= $base_url ?>assets/images/profile.png" class="profile-icon">
            </button>

            <div class="profile-dropdown" id="profile-dropdown">
                <button class="logout-btn" id="logout-btn" data-logout-url="index.php?logout=1">
                    Logout
                </button>
            </div>
        </div>
    </div>
</header>

<div class="orders-page">

    <div class="orders-title">Orders</div>

    <div class="orders-controls">

        <!-- SEARCH -->
        <div class="orders-search-wrapper">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="8" cy="8" r="7"></circle>
                <line x1="13" y1="13" x2="17" y2="17"></line>
            </svg>
            <input type="text" id="orderSearch" class="orders-search" placeholder="Search orders">
        </div>

        <!-- FILTER -->
        <div class="orders-filters">
            <button class="filter active" onclick="filterOrders('all', this)">All</button>
            <button class="filter" onclick="filterOrders('dine', this)">Dine in</button>
            <button class="filter" onclick="filterOrders('takeout', this)">Take out</button>
        </div>

    </div>

<div class="orders-grid">
    <?php foreach($orders as $o): ?>
    <?php 
        $subtotal = 0;
        foreach($o['items'] as $i){
            $subtotal += $i['price'];
        }

        $discountAmount = ($o['discount'] / 100) * $subtotal;
        $total = $subtotal - $discountAmount;
    ?>

    <div class="order-card" data-type="<?= $o['type'] ?>">

        <div class="order-top">
            <span class="order-id">#<?= $o['id'] ?></span>
            <span class="badge <?= $o['type'] ?>">
                <?= $o['type']=='dine'?'Dine in':'Take out' ?>
            </span>
        </div>

        <div class="order-items">
            <?php foreach($o['items'] as $i): ?>
            <div class="order-row">
                <span>1x <?= $i['name'] ?></span>
                <span>₱<?= $i['price'] ?></span>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="divider"></div>

        <div class="order-extra">
            <div class="extra-row">
                <span>Mode of Payment</span>
                <span><?= $o['payment'] ?></span>
            </div>
            <div class="extra-row">
                <span>Discount</span>
                <span>
                    <?= $o['discount'] > 0 ? "-{$o['discount']}%" : "-" ?>
                </span>
            </div>
        </div>

        <div class="order-bottom">
            <div>
                <strong>Total</strong>
                <div class="time">Apr 27, <?= $o['time'] ?></div>
            </div>
            <div class="price">₱<?= number_format($total, 0) ?></div>
        </div>

        <button class="serve-btn" onclick="markServed(this)">
            Mark as served
        </button>

    </div>

    <?php endforeach; ?>
</div>

</div>

<script src="<?= $base_url ?>modules/orders/orders.js"></script>

</body>
</html>