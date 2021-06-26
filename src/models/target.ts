export const targetModel = {
    smtp: {
        type: "string",
        presence: { allowEmpty: false },
        url: {
            schemes: ["smtp", "smtps"],
            allowLocal: true
        }
    },
    origin: {
        type: "string",
        presence: false
    },
    recipients: {
        type: "array",
        presence: { allowEmpty: false }
    },
    from: {
        type: "string",
        presence: false
    },
    redirect: {
        type: "object",
        presence: false
    },
    "redirect.success": {
        type: "string",
        presence: false,
        url: {
            schemes: ["http", "https"],
            allowLocal: true
        }
    },
    "redirect.error": {
        type: "string",
        presence: false,
        url: {
            schemes: ["http", "https"],
            allowLocal: true
        }
    },
    key: {
        type: "string",
        presence: false
    },
    rateLimit: {
        type: "object",
        presence: { allowEmpty: false }
    },
    "rateLimit.timespan": {
        type: "number",
        presence: true
    },
    "rateLimit.requests": {
        type: "number",
        presence: true
    },
    captcha: {
        type: "object",
        presence: false
    },
    "captcha.provider": {
        type: "string",
        inclusion: ["recaptcha", "hcaptcha"]
    }
}