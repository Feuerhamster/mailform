export interface Target {
    smtp: string;
    origin: string;
    recipients: string[];
    from?: string;
    redirect?: Redirects;
    key?: string
    rateLimit?: TargetRateLimit
}

export interface Redirects {
    success?: string;
    error?: string
}

export interface TargetRateLimit {
    timespan: number;
    requests: number;
}