import { RequestBody } from "$models/request.js";
import { IsNotEmpty, IsString } from "class-validator";

export class Login extends RequestBody {
	@IsString()
	@IsNotEmpty()
	username!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;
}
