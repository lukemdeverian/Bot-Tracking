<?php
// helpers.php
// Direct ports of the small utility functions from server.js.

declare(strict_types=1);

function clean_text(?string $value, int $maxLength = 500): string {
    $value = $value ?? '';
    $value = str_replace("\0", '', $value);
    $value = trim($value);
    return mb_substr($value, 0, $maxLength);
}

function digits_only(?string $value): string {
    return preg_replace('/\D/', '', $value ?? '') ?? '';
}

function filled_int(string $value): int {
    return strlen($value) > 0 ? 1 : 0;
}

function get_client_ip(): string {
    // Mirrors server.js: honor X-Forwarded-For (e.g. behind a proxy/load
    // balancer) first, otherwise fall back to the direct connection.
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }

    return $_SERVER['REMOTE_ADDR'] ?? '';
}

function render_thanks_page(): string {
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Chronos Crate Reserved</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="status-page">
      <section class="status-panel">
        <p class="eyebrow">Reservation received</p>
        <h1>See you yesterday.</h1>
        <p>Your reservation for The Chronos Crate has entered the departure queue. Shipment is scheduled for last Tuesday, weather and paradoxes permitting.</p>
        <a href="/">Return to The Chronos Crate</a>
      </section>
    </main>
  </body>
</html>
HTML;
}
