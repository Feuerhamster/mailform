import { Controller, Post, Middleware } from "@overnightjs/core";
import { IRequest, IResponse } from "express";
import { Login } from "$models/request/auth.request.js";
import validate from "$middlewares/validation.middleware.js";
import { config } from "$services/config.service.js";
import { sign } from "$services/auth.service.js";

@Controller("auth")
export default class AuthController {
	@Post("login")
	@Middleware(validate(Login))
	public login(req: IRequest<Login>, res: IResponse) {
		if (req.body.username !== config.username || req.body.password !== config.password) {
			res.error!("login_failed");
			return;
		}

		const token = sign();

		res.send(token).end();
	}
}
