import { ECaptchaProvider, ETargetAllowFiles, ETargetType } from "$models/database.js";
import { RequestBody } from "$models/request.js";
import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
} from "class-validator";

export class TargetAdd extends RequestBody {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsEnum(ETargetType)
	type!: ETargetType;

	@IsUrl({ protocols: ["smtp", "smtps"], require_protocol: true })
	smtp!: string;

	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	@IsEmail({}, { each: true })
	recipients!: string[];

	@IsString()
	@IsOptional()
	origin?: string;

	@IsOptional()
	@IsEnum(ETargetAllowFiles)
	allowFiles?: ETargetAllowFiles;

	@IsOptional()
	@IsEmail()
	from?: string;

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
