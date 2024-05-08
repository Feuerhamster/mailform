import { ECaptchaProvider, ETargetAllowFiles } from "$models/database.js";
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
	Length,
} from "class-validator";

export class TemplateAdd extends RequestBody {
	@IsString()
	@IsNotEmpty()
	@Length(1, 128)
	name!: string;

	@IsString()
	@IsNotEmpty()
	template!: string;
}
