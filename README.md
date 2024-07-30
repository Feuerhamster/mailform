# 📨 MailForm

> The lightweight email service for contact forms and more!

This is basically a minimal self-hosted open source alternative to [Formspree](https://formspree.io/) and [SendGrid](https://sendgrid.com/).

Unlike other mail services (that often gives you an API key for backends), this self-hosted mail service is designed to be accessed directly from a frontend, but also offers you the option to use it as a mail service with configurable API keys.

### Features

-   Access via API or HTML form with redirects
-   Configurable CORS and Origin restriction
-   ReCaptcha and hCaptcha support
-   Custom rate limits for every target
-   Optional API keys

### Planned features

-   [ ] Email Templates
-   [x] File Uploads for attachments
-   [x] ReCaptcha and hCaptcha support

### Used frameworks & libraries

-   [Express](https://expressjs.com/)
-   [Typescript](https://www.typescriptlang.org/)
-   [Nodemailer](https://nodemailer.com/about/)
-   [Validate.js](https://validatejs.org/)
-   [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible)
-   [axios](https://github.com/axios/axios)

## 💽 Installation

### Docker

```shell
git clone https://github.com/Feuerhamster/mailform.git
cd mailform
docker build -t Feuerhamster/mailform .
docker run Feuerhamster/mailform
  -e PORT=3000
  -e PROXY=true
  -v /your/custom/path /app/targets
```

### Manually

_Requires NodeJS 14 or higher_

```shell
git clone https://github.com/Feuerhamster/mailform.git
cd mailform
npm install
npm run build
npm run start
```

## ⚙️Configuration

### Application

MailForm can be configured using environment variables.

**Environment variables:**

-   `PORT` The port on which the application starts. If not provided, a random port will be selected.
-   `TARGETS_DIR` Path to the directory with your target files. Default is `/targets` of the project root.
-   `PROXY` A boolean that enables the "trust proxy" option of Express. **Enable this if you're using MailForm behind a reverse proxy like NGINX!** Default value is false.

### Targets

Targets are your different endpoints each with its own rate limits and smtp provider.
They are JSON files placed in the `/targets` directory.

**Example target:**

```json
{
    "smtp": "smtps://username:password@smtp.example.com",
    "origin": "my-website.com",
    "recipients": ["example@example.com"],
    "rateLimit": {
        "timespan": 300,
        "requests": 1
    },
    "captcha": {
        "provider": "hcaptcha",
        "secret": "xxx"
    }
}
```

**Available fields:**

-   `smtp` _required_ | A valid SMTP(S) url.
-   `origin` _optional_ | A HTTP origin that is used for CORS and to restrict access. Default is \* if not set.
-   `recipients` _required_ | An array of email addresses which should receive the email.
-   `from` _optional_ | The "from" field of an email. This is used as fallback if no "from" is provided in the request.
-   `subjectPrefix` _optional_ | A target-wide prefix for the email subject.
-   `key` _optional_ | A string used as API key if you want to restrict access to this target.
-   `redirect` _optional_:
    -   `success` _optional_: A valid relative or absolute URL to redirect the user if the mail was sent successful.
    -   `error` _optional_: A valid relative or absolute URL to redirect the user if the mail can't be sent due to an error.
-   `rateLimit` _required_:
    -   `timespan` _required_ | Timespan (in seconds) for the rate limiter to reset.
    -   `requests` _required_ | Allowed amount of requests in the given timespan.
-   `captcha` _optional_:
    -   `provider` _required if captcha_ | The captcha provider ("recaptcha" or "hcaptcha").
    -   `secret` _required if captcha_ | Secret key for your captcha.

For the exact validations of the fields please see here: [target.ts](/src/models/target.ts)

## 📫 Usage

### Fields

Whether as formular data or json, the fields are the same.

-   `from` _optional_ | The email address of the sender. If this filed is not set, the "from" field of your target will be used.
-   `firstName` _optional_ | A classic first name filed which will be attached to the "from" field of the email.
-   `lastName` _optional_ | A classic last name filed which will be attached to the "from" field of the email.
-   `subjectPrefix` _optional_ | A Prefix for the email subject.
-   `subject` _required_ | The email subject.
-   `body` _required_ | The email body (supports HTML).
-   `g-recaptcha-response` _only required if target use captcha_ | Field for ReCaptcha response.
-   `h-captcha-response` _only required if target use captcha_ | Field for hCaptcha response.

For the exact validations of the fields please see here: [posts.ts](/src/models/post.ts)

**Important info:** If a redirect is configured for your target, it will always return the redirect, even if you make an API call.
If no redirect is set, http status codes will be returned.

### Captchas

MailForm supports both [ReCaptcha](https://www.google.com/recaptcha/) and [hCaptcha](https://www.hcaptcha.com/).

To use captchas, you have to configure it in your target.

On a request, the corresponding field (`g-recaptcha-response` for ReCaptcha or `h-captcha-response` for hCaptcha) have to be filled for validation.
If you use the captcha widget in a form, this will happen automatically.
If you use an API request, you have to fill it manually.

### HTML Form

**Example html form:**

```html
<form method="post" action="https://mailform.yourserver.com/your-target-file-name">
    <input type="email" name="from" placeholder="Sender's email address" />
    <input type="text" name="firstName" placeholder="First name" />
    <input type="text" name="lastName" placeholder="Last name" />
    <input type="hidden" name="subjectPrefix" value="[App-Question] " />
    <input type="text" name="subject" placeholder="Subject" />
    <div class="g-recaptcha" data-sitekey="your_site_key"></div>
    <textarea name="body" placeholder="Your message"></textarea>
</form>
```

To work properly, you may want to configure a redirect in the target.

### API

Simply make a request to `/:target` (replace with your target's file name).
If you have set an API key, add the HTTP Authorization header with type `Bearer` and then the key.
Make sure to also use the right origin (if not set automatically because the request is from a backend).

> ⚠ Since the file upload feature got added, there is an Issue with `application/json`. Please use multipart form or form urlencoded for API requests. I am working on a rewrite where this gets fixed.

**Example request:**

```http request
POST https://mailform.yourserver.com/your-target-file-name
Origin: your-configured-origin.com
Content-Type: application/json
Authorization: Bearer your-optional-api-key

{
  "from": "example@example.com",
  "subject": "your subect",
  "body": "your message",
}
```

**Possible status codes:**

-   `200` Email was successfully sent.
-   `401` Authentication failed: API key not present or wrong.
-   `403` Forbidden because of wrong origin header.
-   `404` Target not found.
-   `500` Sending the email failed.

## 👋 Contribution

Feel free to create issues and pull requests if you want!

Please keep up with the code style and discuss new features beforehand with the project owner.
