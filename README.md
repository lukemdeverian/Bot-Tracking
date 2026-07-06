# Bot Tracking Research Prototype

This project is a web form prototype for researching bot activity on websites. The goal is to observe how automated visitors interact with common form inputs, including whether they fill personal information fields, payment-style fields, contact fields, or future honeypot fields.

The app is currently built with only HTML and CSS. There is no JavaScript, backend, database, logging, or file storage in the current version. The plan is to log bot data via the domain's logs instead since ip addresses, user agents, request times, and much more data is available to analyze.

## Project Team

This project is developed by Luke Deverian and mentored by Professor Thomas Powell.

## Research Goals

- Study how bots interact with realistic web form fields.
- Compare expected human form behavior with automated form-filling behavior.
- Support future experiments around hidden honeypot fields, file uploads, URLs, and authentication-style inputs.
- Provide a simple front-end surface that can later be connected to safe, controlled tracking logic.

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
- Card number
- Expiration
- Security code

## Running Locally

Because this is a static HTML/CSS project, no build step is required.

Open `index.html` directly in a web browser to view the form.

## Deployment Plan

The long-term plan is to publish this website on a public domain so it can receive real-world traffic and help collect bot interaction data. Hosting the form online will make it possible to observe which fields bots attempt to fill, what types of values they submit, and how their behavior differs from expected human use.

Any public deployment should be configured carefully so the project only collects data needed for the research goals. The site should avoid encouraging real users to submit sensitive information, and any future logging should prioritize safe metadata such as filled fields, timestamps, interaction patterns, submitted test values, and bot-like behavior indicators.

## Safety Notes

This project is for research and prototyping only. Do not enter, collect, store, or transmit real sensitive information such as real credit card numbers, passwords, addresses, or personal contact details.

Any future tracking, upload handling, URL collection, or credential-style experiments should treat all submitted data as unsafe and potentially sensitive. Uploaded files and submitted URLs should never be executed, opened automatically, or served back to users.

## Future Development Ideas

- Expand the front end beyond the current black-and-white prototype by adding a stronger visual theme. One possible direction is a Pokemon-inspired "Pokebots" theme where the research interface frames bot tracking as trying to "catch" different bot types.
- Add a file upload field for observing whether bots attempt to submit files.
- Add a URL or website field for analyzing submitted links.
- Add username and password-style fields without implementing real authentication.
- Add safe backend logging for metadata such as field completion, timing, and interaction patterns.
- Create documentation for ethical research setup, consent boundaries, and safe handling of collected data.
