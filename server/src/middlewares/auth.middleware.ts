import { IRequest, IResponse, NextFunction } from "express";
import { verify } from "$services/auth.service.js";

// Middleware to authenticate and authorize users with jsonwebtoken
export default function authenticate(req: IRequest, res: IResponse, next: NextFunction) {
	const header = req.header("authorization");

	if (!header) {
		res.error!("invalid_authorization");
		return;
	}

	const extracted = /Bearer (.+)/.exec(header);

	if (!extracted) {
		res.error!("invalid_authorization");
		return;
	}

	const success = verify(extracted[1]);

	if (!success) {
		res.error!("invalid_authorization");
		return;
	}

	next();
}
