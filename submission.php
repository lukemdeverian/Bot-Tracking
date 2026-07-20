<?php
// submission.php
// Ports buildSubmission() and handleCheckout() from server.js.

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

function handle_checkout(string $formSource = 'main_checkout'): void {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/x-www-form-urlencoded') === false) {
        http_response_code(415);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Unsupported content type';
        return;
    }

    try {
        $password    = clean_text($_POST['account_password'] ?? '', 200);
        $cardDigits  = digits_only(clean_text($_POST['card_number'] ?? '', 120));
        $expiration  = clean_text($_POST['expiration'] ?? '', 40);
        $securityCode = clean_text($_POST['security_code'] ?? '', 40);

        // Same de-duplicated, sorted list of submitted field names as server.js.
        $fieldNames = array_keys($_POST);
        $fieldNames = array_unique($fieldNames);
        sort($fieldNames);
        $fieldNamesStr = implode(',', $fieldNames);

        $params = [
            $formSource,
            (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z'),
            clean_text(get_client_ip(), 120),
            clean_text($_SERVER['HTTP_USER_AGENT'] ?? '', 500),
            clean_text($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '', 200),
            clean_text($_SERVER['HTTP_REFERER'] ?? '', 500),
            clean_text($_POST['first_name'] ?? '', 120),
            clean_text($_POST['last_name'] ?? '', 120),
            clean_text($_POST['email'] ?? '', 240),
            clean_text($_POST['phone_number'] ?? '', 80),
            clean_text($_POST['street_address'] ?? '', 300),
            clean_text($_POST['city'] ?? '', 120),
            clean_text($_POST['state'] ?? '', 80),
            clean_text($_POST['zip'] ?? '', 40),
            clean_text($_POST['website'] ?? '', 500),
            clean_text($_POST['destination_year'] ?? '', 40),
            clean_text($_POST['username'] ?? '', 160),
            filled_int($password),
            strlen($password),
            $cardDigits !== '' ? 1 : 0,
            substr($cardDigits, -4),
            strlen($cardDigits),
            filled_int($expiration),
            strlen($expiration),
            filled_int($securityCode),
            strlen($securityCode),
            clean_text($_POST['quantity'] ?? '', 40),
            clean_text($_POST['company'] ?? '', 240), // honeypot field
            $fieldNamesStr,
        ];

        $db = get_db();
        $stmt = $db->prepare("
            INSERT INTO submissions (
                form_source, created_at, ip_address, user_agent, accept_language,
                referrer, first_name, last_name, email, phone_number, street_address,
                city, state, zip, website, destination_year, username,
                password_filled, password_length, card_filled, card_last4, card_length,
                expiration_filled, expiration_length, security_code_filled, security_code_length,
                quantity, honeypot_company, field_names
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        ");
        $stmt->execute($params);

        header('Content-Type: text/html; charset=utf-8');
        echo render_thanks_page();
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo $e->getMessage();
    }
}
