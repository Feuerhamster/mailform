import { ValidationError } from "class-validator";
import { IRequest, IResponse, NextFunction } from "express";
import { responseErrorCodes, ResponseErrorCode } from "$models/response/error.response.js";

/**
 * Middleware to extend the express response object with an error function
 */
export function errorFunctionMiddleware(req: IRequest, res: IResponse, next: NextFunction) {
	res.error = function (error: ResponseErrorCode, problems?: ValidationError[]) {
		return res.status(responseErrorCodes[error]).json({ error, problems }).end();
	};

	return next();
}
