export interface Target {
    smtp: string;
    origin: string;
    recipients: string[];
    from?: string;
    redirect?: Redirects;
    key?: string;
    rateLimit?: TargetRateLimit;
    captcha?: TargetCaptchaOptions
}

export interface Redirects {
    success?: string;
    error?: string
}

export interface TargetRateLimit {
    timespan: number;
    requests: number;
}

export interface TargetCaptchaOptions {
    provider: CaptchaProvider;
    secret: string;
}

export enum CaptchaProvider {
    RECAPTCHA = "recaptcha",
    HCAPTCHA = "hcaptcha"
}