import { Insertable, JSONColumnType, Selectable, Updateable } from "kysely";

export interface IDatabase {
	targets: ITargetTable;
}

export enum ETargetType {
	REDIRECT,
	API,
}

export enum ECaptchaProvider {
	RECAPTCHA,
	HCAPTCHA,
}

export enum ETargetStatus {
	ENABLED,
	DISABLED,
}

export enum ETargetAllowFiles {
	FALSE,
	TRUE,
}

export interface ITargetTable {
	id: string;

	name: string;

	type: ETargetType;
	status: ETargetStatus;

	smtp: string;

	origin: string | null;

	from: string | null;

	recipients: JSONColumnType<string[]>;

	allowFiles: ETargetAllowFiles;

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
