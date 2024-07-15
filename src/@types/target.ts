import { LanguageKey } from "../services/pipedrive/person";

export interface Target {
    smtp: string;
    origin: string;
    recipients: string[];
    from?: string;
    subjectPrefix?: string;
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

// export type Language = "GERMAN" | "ENGLISH" | "FRANCE" | "ITALY" | "SPAIN";

export interface ContactForm {
    firstname: string,
    lastname: string,
    org: string, 
    email: string,
    phone?: string,
    msg?: string,
    language?: LanguageKey,
}