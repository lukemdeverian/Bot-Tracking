<?php
// db.php
// Shared database connection + schema setup.
// Mirrors the table created in the original server.js exactly, so no data
// format changes are needed if you're migrating an existing .sqlite file.

declare(strict_types=1);

function get_db(): PDO {
    static $db = null;

    if ($db !== null) {
        return $db;
    }

    $dataDir = __DIR__ . '/.data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0775, true);
    }

    $dbPath = $dataDir . '/bot-submissions.sqlite';

    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->exec("
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_source TEXT NOT NULL DEFAULT 'main_checkout',
            created_at TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            accept_language TEXT,
            referrer TEXT,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone_number TEXT,
            street_address TEXT,
            city TEXT,
            state TEXT,
            zip TEXT,
            website TEXT,
            destination_year TEXT,
            username TEXT,
            password_filled INTEGER NOT NULL,
            password_length INTEGER NOT NULL,
            card_filled INTEGER NOT NULL,
            card_last4 TEXT,
            card_length INTEGER NOT NULL,
            expiration_filled INTEGER NOT NULL,
            expiration_length INTEGER NOT NULL,
            security_code_filled INTEGER NOT NULL,
            security_code_length INTEGER NOT NULL,
            quantity TEXT,
            honeypot_company TEXT,
            field_names TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_submissions_created_at
        ON submissions (created_at);
    ");

    return $db;
}
