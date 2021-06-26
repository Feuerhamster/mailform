export const postBody = {
    from: {
        type: "string",
        presence: false,
        email: true
    },
    firstName: {
        type: "string",
        presence: false,
        length: {
            minimum: 2,
            maximum: 100
        }
    },
    lastName: {
        type: "string",
        presence: false,
        length: {
            minimum: 2,
            maximum: 100
        }
    },
    subject: {
        type: "string",
        presence: { allowEmpty: false },
        length: {
            minimum: 2,
            maximum: 255
        }
    },
    body: {
        type: "string",
        presence: { allowEmpty: false },
        length: {
            minimum: 5,
            maximum: 32000
        }
    },
    "g-recaptcha-response": {
        type: "string",
        presence: false
    },
    "h-captcha-response": {
        type: "string",
        presence: false
    }
}