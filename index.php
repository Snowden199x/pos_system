<?php
session_start();

$valid_username = "admin";
$valid_password = "password123";

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"] ?? "");
    $password = trim($_POST["password"] ?? "");

    if ($username === $valid_username && $password === $valid_password) {
        $_SESSION["logged_in"] = true;
        $_SESSION["username"] = $username;
        header("Location: dashboard.php");
        exit();
    } else {
        $error = "Invalid username or password.";
    }
}

if (isset($_SESSION["logged_in"]) && $_SESSION["logged_in"] === true) {
    header("Location: dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>

<h2>Login</h2>

<?php if ($error): ?>
    <p style="color: red;"><?php echo htmlspecialchars($error); ?></p>
<?php endif; ?>

<form method="POST" action="">
    <p>
        <label for="username">Username:</label><br>
        <input type="text" id="username" name="username" required>
    </p>
    <p>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password" required>
    </p>
    <p>
        <button type="submit">Login</button>
    </p>
</form>

</body>
</html>