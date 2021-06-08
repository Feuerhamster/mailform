# 📨 MailForm
> The minimalistic email relay for contact forms and more!

This is basically a minimal self-hosted open source alternative to [Formspree](https://formspree.io/) and [SendGrid](https://sendgrid.com/).  
Unlike other mail services (that often gives you an API key), this self-hosted mail service is designed to be accessed directly from a frontend.

### Features
- Access via API or HTML form + redirect
- CORS and Origin restriction
- Custom rate limits for every target
- Optional API keys

### Planned features
- [ ] Email Templates
- [ ] File Uploads for attachments

### Used frameworks & libraries
- [Express](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Nodemailer](https://nodemailer.com/about/)
- [Validate.js](https://validatejs.org/)
- [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible)

## 💽 Installation
### Docker
```shell
git clone https://github.com/Feuerhamster/mailform.git
cd mailform
docker build -t Feuerhamster/mailform .
docker run Feuerhamster/mailform
  -e PORT=3000
  -v /your/custom/path /app/targets
```

### Manually
*Requires NodeJS 14 or higher*

```shell
git clone https://github.com/Feuerhamster/mailform.git
cd mailform
npm install
npm run build
npm run start
```

## ⚙️Configuration
### Application
To configure the port, simply set the environment variable `PORT` to the port you want to have.
If you want to have your targets in a different directory, you can change that in the `TARGETS_DIR` environment variable.

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
    }
}
```

**Available fields:**
- `smtp` *required* | A valid SMTP(S) url.
- `origin` *required* | A HTTP origin that is used for CORS and to restrict access.
- `recipients` *required* | An array of email addresses which should receive the email.
- `from` *optional* | The "from" field of an email. This is used as fallback if no "from" is provided in the request.
- `key` *optional* | A string used as API key if you want to restrict access to this target.
- `redirect` *optional*:
  - `success` *optional*: A valid URL to redirect the user if the mail was sent successful.
  - `error` *optional*: A valid URL to redirect the user if the mail can't be sent due to an error.
- `rateLimit` *required*:
    - `timespan` *required* | Timespan (in seconds) for the rate limiter to reset.
    - `requests` *required* | Allowed amount of requests in the given timespan.

For the exact validations of the fields please see here: [target.ts](/src/models/target.ts)

## 📫 Usage
### Fields
Whether as formular data or json, the fields are the same.

- `from` *optional* | The email address of the sender. If this filed is not set, the "from" field of your target will be used.
- `firstName` *optional* | A classic first name filed which will be attached to the "from" field of the email.
- `lastName` *optional* | A classic last name filed which will be attached to the "from" field of the email.
- `subject` *required* | The email subject.
- `body` *required* | The email body (supports HTML).

For the exact validations of the fields please see here: [posts.ts](/src/models/post.ts)

**Important info:** If a redirect is configured for your target, it will always return the redirect, even if you make an API call.
If no redirect is set, http status codes will be returned.

### HTML Form

**Example html form:**
```html
<form method="post" action="https://mailform.yourserver.com/your-target-file-name">
    <input type="email" name="from" placeholder="Sender's email address"/>
    <input type="text" name="firstName" placeholder="First name" />
    <input type="text" name="lastName" placeholder="Last name" />
    <input type="text" name="subject" placeholder="Subject" />
    <textarea name="body" placeholder="Your message"></textarea>
</form>
```

To work properly, you may want to configure a redirect in the target.

### API
Simply make a request to `/:target` (replace with your target's file name).
If you have set an API key, add the HTTP Authorization header with type `Bearer` and then the key.
Make sure to also use the right origin (if not set automatically because the request is from a backend).

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

## 👋 Contribution
Feel free to create issues and pull requests if you want!

Please keep up with the code style and discuss new features beforehand with the project owner.