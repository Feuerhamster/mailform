import { Insertable, JSONColumnType, Selectable, Updateable } from "kysely";

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

export interface ITargetTable {
	id: string;

	name: string;

	status: ETargetStatus;

	smtp: string;

	origin: string | null;

	from: string;

	recipients: JSONColumnType<string[]>;

	allow_files: EDatabaseBoolean;
	allow_templates: EDatabaseBoolean;
	allow_custom_recipients: EDatabaseBoolean;

	subject_prefix: string | null;

	ratelimit_timespan: number | null;
	ratelimit_requests: number | null;

	api_key: string | null;

	success_redirect: string | null;
	error_redirect: string | null;

	captcha_provider: ECaptchaProvider | null;
	captcha_secret: string | null;
}

export type Target = Selectable<ITargetTable>;
export type NewTarget = Insertable<ITargetTable>;
export type TargetUpdate = Updateable<ITargetTable>;

export interface ITemplateTable {
	id: string;
	name: string;
	template: string;
}

export type Template = Selectable<ITemplateTable>;
export type NewTemplate = Insertable<ITemplateTable>;
export type TemplateUpdate = Updateable<ITemplateTable>;

export interface IDatabase {
	targets: ITargetTable;
	templates: ITemplateTable;
}
