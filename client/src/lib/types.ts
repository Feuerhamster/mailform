export enum ECaptchaProvider {
	RECAPTCHA,
	HCAPTCHA,
}

export enum ETargetStatus {
	ENABLED,
	DISABLED,
}

export enum EDatabaseBoolean {
	FALSE,
	TRUE,
}

export interface ITarget {
	id: string;

	name: string;

	status: ETargetStatus;

	smtp: string;

	origin: string | null;

	from: string;

	recipients: string[];

	allow_files: EDatabaseBoolean;
	allow_templates: EDatabaseBoolean;

	subject_prefix: string | null;

	ratelimit_timespan: number | null;
	ratelimit_requests: number | null;

	api_key: string | null;

	success_redirect: string | null;
	error_redirect: string | null;

	captcha_provider: ECaptchaProvider | null;
	captcha_secret: string | null;
}
