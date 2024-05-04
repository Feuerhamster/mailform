import { Controller, Middleware, Get, Post, Delete, Patch } from "@overnightjs/core";
import { IRequest, IResponse } from "express";
import authenticate from "$middlewares/auth.middleware.js";
import {
	deleteTarget,
	getAllTargets,
	insertTarget,
	updateTarget,
} from "$services/database.service.js";
import { ITargetTable } from "$models/database.js";
import validate, { validateOptional } from "$middlewares/validation.middleware.js";
import { TargetAdd } from "$models/request/target.request.js";
import { StatusCode } from "$types/httpStatusCodes.js";

@Controller("targets")
export default class AuthController {
	@Get("/")
	@Middleware(authenticate)
	public async getTargets(req: IRequest, res: IResponse) {
		const targets = await getAllTargets();
		res.send(targets);
	}

	@Post("/")
	@Middleware(authenticate)
	@Middleware(validate(TargetAdd))
	public async createTarget(req: IRequest<TargetAdd>, res: IResponse) {
		try {
			await insertTarget(req.body);
		} catch (e) {
			res.error!("operation_failed");
			return;
		}

		res.status(StatusCode.OK).end();
	}

	@Patch(":targetId")
	@Middleware(authenticate)
	@Middleware(validateOptional(TargetAdd))
	public async updateTarget(
		req: IRequest<Partial<TargetAdd>, {}, { targetId: string }>,
		res: IResponse,
	) {
		try {
			await updateTarget(req.params.targetId, req.body);
		} catch (e) {
			res.error!("operation_failed");
			return;
		}

		res.status(StatusCode.OK).end();
	}

	@Delete(":targetId")
	@Middleware(authenticate)
	public async deleteTarget(req: IRequest<{}, {}, { targetId: string }>, res: IResponse) {
		try {
			await deleteTarget(req.params.targetId);
		} catch (e) {
			res.error!("operation_failed");
			return;
		}

		res.status(StatusCode.OK).end();
	}
}
