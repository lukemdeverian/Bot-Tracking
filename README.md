# Bot Tracking Research Prototype

This project is a web form prototype for researching bot activity on websites. The current site is styled as a joke product checkout page for The Chronos Crate, an obviously absurd time-machine product that still gives bots a realistic form surface to interact with.

The app uses a static HTML/CSS frontend served by a Node.js backend. Form submissions are stored in a local SQLite database using Node's built-in SQLite support. No frontend framework is used.

[link to site](https://lukemdeverian.github.io/Bot-Tracking/)

## Project Team

This project is developed by Luke Deverian and mentored by Professor Thomas Powell.

## Research Goals

- Study how bots interact with realistic web form fields.
- Compare expected human form behavior with automated form-filling behavior.
- Support experiments around hidden honeypot fields, URLs, and authentication-style inputs.
- Compare passive domain or server log data with structured backend submission data.
- Provide a themed product storefront that can attract bot traffic while remaining clearly humorous to human visitors.

## Current Form Fields

The prototype currently includes:

- First name
- Last name
- Email
- Phone number
- Street address
- City
- State
- ZIP code
- Website
- Destination year
- Username
- Password
- Card number
- Expiration
- Security code
- Quantity
- Hidden honeypot company field

The SQLite database is created locally at:

```txt
.data/bot-submissions.sqlite
```

## Priority Form And Robots File

The project includes an additional unlinked priority form route for observing whether bots access pages that are not part of the visible site navigation:

```txt
/priority-form
```

The standard `robots.txt` file disallows bots from accessing the priority form and its submission endpoint:

```txt
/robots.txt
```

For convenience, the server also serves the same content at `/robot.txt`, but `/robots.txt` is the standard filename crawlers look for.

Submissions from the priority form are stored in the same SQLite database with `form_source` set to `priority_form`.

## Deployment Plan

The long-term plan is to publish this website on a public domain so it can receive real-world traffic and help collect bot interaction data. Hosting the form online will make it possible to observe which fields bots attempt to fill, what types of values they submit, and how their behavior differs from expected human use.

Domain, hosting, or CDN logs can provide passive traffic details such as IP addresses, user agents, request times, requested paths, and status codes. The backend database provides more structured form-submission data, such as which fields were filled and whether the hidden honeypot field was submitted.

Any public deployment should be configured carefully so the project only collects data needed for the research goals. The site should avoid encouraging real users to submit sensitive information, and logging should prioritize safe metadata such as filled fields, timestamps, interaction patterns, submitted test values, and bot-like behavior indicators.

## Safety Notes

This project is for research and prototyping only. Do not enter, collect, store, or transmit real sensitive information such as real credit card numbers, passwords, addresses, or personal contact details.

The backend intentionally avoids storing raw passwords, raw security codes, or full card numbers. Instead, it stores safer metadata such as whether those fields were filled, their input length, and the last four digits of a submitted card number. Any URL collection or credential-style experiment should treat submitted data as unsafe and potentially sensitive. Uploaded files and submitted URLs should never be executed, opened automatically, or served back to users.
