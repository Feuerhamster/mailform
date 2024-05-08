import { RequestBody } from "$models/request.js";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class TemplateAdd extends RequestBody {
	@IsString()
	@IsNotEmpty()
	@Length(1, 128)
	name!: string;

	@IsString()
	@IsNotEmpty()
	template!: string;
}
