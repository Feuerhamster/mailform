import { IRequest, IResponse, NextFunction } from "express";
import { verify } from "$services/auth.service.js";

// Middleware to authenticate and authorize users with jsonwebtoken
export default function authenticate(req: IRequest, res: IResponse, next: NextFunction) {
	if (!req.cookies["auth-token"]) {
		res.error!("invalid_authorization");
		return;
	}

	let token = req.cookies["auth-token"];

	const success = verify(token);

	if (!success) {
		res.error!("invalid_authorization");
		return;
	}

	next();
}
