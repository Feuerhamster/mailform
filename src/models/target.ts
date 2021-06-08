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
        presence: { allowEmpty: false }
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
        url: true
    },
    "redirect.error": {
        type: "string",
        presence: false,
        url: true
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
    }
}