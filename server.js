const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, ".data");
const DB_PATH = path.join(DATA_DIR, "bot-submissions.sqlite");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 1024 * 1024;

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
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
`);

const submissionColumns = db.prepare("PRAGMA table_info(submissions)").all();
const hasFormSourceColumn = submissionColumns.some((column) => column.name === "form_source");

if (!hasFormSourceColumn) {
  db.exec("ALTER TABLE submissions ADD COLUMN form_source TEXT NOT NULL DEFAULT 'main_checkout'");
}

const insertSubmission = db.prepare(`
  INSERT INTO submissions (
    form_source,
    created_at,
    ip_address,
    user_agent,
    accept_language,
    referrer,
    first_name,
    last_name,
    email,
    phone_number,
    street_address,
    city,
    state,
    zip,
    website,
    destination_year,
    username,
    password_filled,
    password_length,
    card_filled,
    card_last4,
    card_length,
    expiration_filled,
    expiration_length,
    security_code_filled,
    security_code_length,
    quantity,
    honeypot_company,
    field_names
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function serveFile(res, fileName, contentType) {
  const filePath = path.join(ROOT_DIR, fileName);

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
      return;
    }

    send(res, 200, { "Content-Type": contentType }, contents);
  });
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large"));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function cleanText(value, maxLength = 500) {
  return String(value || "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function filledInt(value) {
  return cleanText(value).length > 0 ? 1 : 0;
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.socket.remoteAddress || "";
}

function buildSubmission(req, body, formSource) {
  const params = new URLSearchParams(body);
  const field = (name, maxLength) => cleanText(params.get(name), maxLength);
  const password = field("account_password", 200);
  const cardDigits = digitsOnly(field("card_number", 120));
  const expiration = field("expiration", 40);
  const securityCode = field("security_code", 40);
  const fieldNames = Array.from(new Set(params.keys())).sort().join(",");

  return [
    formSource,
    new Date().toISOString(),
    cleanText(getClientIp(req), 120),
    cleanText(req.headers["user-agent"], 500),
    cleanText(req.headers["accept-language"], 200),
    cleanText(req.headers.referer || req.headers.referrer, 500),
    field("first_name", 120),
    field("last_name", 120),
    field("email", 240),
    field("phone_number", 80),
    field("street_address", 300),
    field("city", 120),
    field("state", 80),
    field("zip", 40),
    field("website", 500),
    field("destination_year", 40),
    field("username", 160),
    filledInt(password),
    password.length,
    cardDigits.length > 0 ? 1 : 0,
    cardDigits.slice(-4),
    cardDigits.length,
    filledInt(expiration),
    expiration.length,
    filledInt(securityCode),
    securityCode.length,
    field("quantity", 40),
    field("company", 240),
    fieldNames,
  ];
}

function renderThanksPage() {
  return `<!DOCTYPE html>
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
</html>`;
}

async function handleCheckout(req, res, formSource = "main_checkout") {
  const contentType = req.headers["content-type"] || "";

  if (!contentType.includes("application/x-www-form-urlencoded")) {
    send(res, 415, { "Content-Type": "text/plain; charset=utf-8" }, "Unsupported content type");
    return;
  }

  try {
    const body = await collectBody(req);
    insertSubmission.run(...buildSubmission(req, body, formSource));
    send(res, 200, { "Content-Type": "text/html; charset=utf-8" }, renderThanksPage());
  } catch (error) {
    const status = error.message.includes("large") ? 413 : 500;
    send(res, status, { "Content-Type": "text/plain; charset=utf-8" }, error.message);
  }
}

async function handleRequest(req, res) {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    serveFile(res, "index.html", "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && req.url === "/styles.css") {
    serveFile(res, "styles.css", "text/css; charset=utf-8");
    return;
  }

  if (req.method === "GET" && (req.url === "/hidden-form" || req.url === "/hidden-form.html")) {
    serveFile(res, "hidden-form.html", "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && (req.url === "/robots.txt" || req.url === "/robot.txt")) {
    serveFile(res, "robots.txt", "text/plain; charset=utf-8");
    return;
  }

  if (req.method === "GET" && req.url === "/thanks") {
    send(res, 200, { "Content-Type": "text/html; charset=utf-8" }, renderThanksPage());
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    send(res, 200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && req.url === "/checkout") {
    await handleCheckout(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/hidden-checkout") {
    await handleCheckout(req, res, "hidden_form");
    return;
  }

  send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, error.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`The Chronos Crate server running at http://${HOST}:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});
