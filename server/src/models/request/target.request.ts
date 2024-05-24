import { ECaptchaProvider, EDatabaseBoolean, ETargetStatus } from "$models/database.js";
import { RequestBody } from "$models/request.js";
import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	IsUrl,
	Length,
} from "class-validator";

export class TargetAdd extends RequestBody {
	@IsString()
	@IsNotEmpty()
	name!: string;

	// @IsUrl({ protocols: ["smtp", "smtps"], require_protocol: true, allow_underscores: true })
	@IsString()
	@IsNotEmpty()
	smtp!: string;

	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	@IsEmail({}, { each: true })
	recipients!: string[];

	@IsOptional()
	@IsEnum(ETargetStatus)
	status?: ETargetStatus;

	@IsOptional()
	@IsString()
	origin?: string;

	@IsOptional()
	@IsString()
	api_key?: string;

	@IsOptional()
	@IsEnum(EDatabaseBoolean)
	allow_files?: EDatabaseBoolean;

	@IsOptional()
	@IsEnum(EDatabaseBoolean)
	allow_templates?: EDatabaseBoolean;

	@IsOptional()
	@IsEnum(EDatabaseBoolean)
	allow_custom_recipients?: EDatabaseBoolean;

	@IsEmail()
	from!: string;

	@IsOptional()
	@IsString()
	subject_prefix?: string;

	@IsOptional()
	@IsNumber()
	ratelimit_timespan?: number;

	@IsOptional()
	@IsNumber()
	ratelimit_requests?: number;

	@IsOptional()
	@IsString()
	success_redirect?: string;

	@IsOptional()
	@IsString()
	error_redirect?: string;

	@IsOptional()
	@IsEnum(ECaptchaProvider)
	captcha_provider?: ECaptchaProvider;

	@IsOptional()
	@IsString()
	captcha_secret?: string;
}

export class ExecuteTarget extends RequestBody {
	@IsOptional()
	@IsEmail()
	from?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Length(1, 200)
	firstName?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Length(1, 200)
	lastName?: string;

	@IsOptional()
	@IsString()
	@Length(1, 100)
	subjectPrefix?: string;

	@IsString()
	@IsNotEmpty()
	@Length(1, 512)
	subject!: string;

	@IsString()
	@IsNotEmpty()
	@Length(5, 10000)
	body!: string;

	@IsOptional()
	@IsNotEmpty()
	@Length(16)
	template?: string;

	@IsOptional()
	@IsObject()
	templateData?: Object;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	@IsEmail({}, { each: true })
	to?: string[];

	@IsOptional()
	@IsString()
	"g-recaptcha-response"?: string;

	@IsOptional()
	@IsString()
	"h-captcha-response"?: string;
}
