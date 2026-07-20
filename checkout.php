<?php
declare(strict_types=1);
require_once __DIR__ . '/submission.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

handle_checkout('main_checkout');
