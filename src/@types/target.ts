import {LanguageKey} from "../services/pipedrive/types";

export interface Target {
    smtp: string;
    origin: string;
    recipients: string[];
    from?: string;
    subjectPrefix?: string;
    redirect?: Redirects;
    key?: string;
    rateLimit?: TargetRateLimit;
    captcha?: TargetCaptchaOptions;
}

export interface Redirects {
    success?: string;
    error?: string;
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
    HCAPTCHA = "hcaptcha",
}

export interface ContactForm {
    name: string;
    organization: string;
    email: string;
    phone?: string;
    message?: string;
    language?: LanguageKey;
}
