<?php
session_start();

// Handle logout
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header("Location: index.php");
    exit();
}

$valid_username = "admin";
$valid_password = "password123";

$error = "";

// If already logged in, route to the correct page
if (isset($_SESSION["logged_in"])) {
    $page = isset($_GET['page']) ? $_GET['page'] : 'home';

    if ($page === 'home') {
        include 'modules/homepage/homepage.php';
    } elseif ($page === 'orders') {
        include 'modules/orders/orders.php';
    } elseif ($page === 'served') {
        include 'modules/served/served.php';
    } elseif ($page === 'statistics') {
        include 'modules/statistics/statistics.php';
    } else {
        include 'modules/homepage/homepage.php';
    }
    exit();
}

// Handle login form submission
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"] ?? "");
    $password = trim($_POST["password"] ?? "");

    if ($username === $valid_username && $password === $valid_password) {
        $_SESSION["logged_in"] = true;
        $_SESSION["username"] = $username;

        header("Location: index.php?page=home");
        exit();
    } else {
        $error = "Invalid username or password.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twist &amp; Roll — Login</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DM Sans', sans-serif;
            background: #F5F3E8;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .login-card {
            background: #fff;
            border: 1px solid #D8D4C0;
            border-radius: 16px;
            padding: 40px 36px;
            width: 100%;
            max-width: 360px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
        }

        .login-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid #D8D4C0;
            object-fit: cover;
            background: #EAE8D6;
        }

        .login-title {
            font-family: 'DM Serif Display', serif;
            font-size: 24px;
            color: #2C2C1A;
            text-align: center;
        }

        .login-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        label {
            font-size: 13px;
            font-weight: 500;
            color: #7A7A5A;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #D8D4C0;
            border-radius: 8px;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            color: #2C2C1A;
            background: #FAFAF2;
            outline: none;
            transition: border-color 0.18s;
        }

        input:focus {
            border-color: #C8A84B;
        }

        .error-msg {
            font-size: 13px;
            color: #C0392B;
            background: #fde8e8;
            border-radius: 6px;
            padding: 8px 12px;
            text-align: center;
            width: 100%;
        }

        .login-btn {
            width: 100%;
            padding: 12px;
            background: #2D6A4F;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.18s;
            margin-top: 4px;
        }

        .login-btn:hover { background: #245a42; }
    </style>
</head>
<body>

<div class="login-card">
    <img src="assets/images/logo.png" alt="Twist &amp; Roll" class="login-logo"
         onerror="this.style.display='none'">
    <h1 class="login-title">Twist &amp; Roll POS</h1>

    <?php if ($error): ?>
        <p class="error-msg"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <form class="login-form" method="POST" action="">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required autocomplete="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
        </div>
        <button type="submit" class="login-btn">Login</button>
    </form>
</div>

</body>
</html>