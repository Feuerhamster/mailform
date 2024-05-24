import { Controller, Middleware, Get, Post, Delete, Patch } from "@overnightjs/core";
import { IRequest, IResponse } from "express";
import authenticate from "$middlewares/auth.middleware.js";
import {
	deleteTarget,
	getAllTargets,
	insertTarget,
	updateTarget,
} from "$services/database.service.js";
import validate, {
	validateOptional,
	validateStandalone,
} from "$middlewares/validation.middleware.js";
import { ExecuteTarget, TargetAdd } from "$models/request/target.request.js";
import { StatusCode } from "$types/httpStatusCodes.js";
import { targetPreHandler } from "$middlewares/target.middleware.js";

import { fetchTarget } from "$services/target.service.js";
import getRedirectUrl from "$utils/redirect.util.js";
import { formatFromField } from "$utils/formatFromField.util.js";
import { mapFiles, sendMail } from "$services/email.service.js";
import multer from "multer";
import { TargetUpdate } from "$models/database";
import { renderTemplate } from "$services/template.service.js";

const upload = multer({ dest: "./attatchment-uploads/" });

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
	public async updateTarget(req: IRequest<TargetUpdate, {}, { targetId: string }>, res: IResponse) {
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

	@Post(":targetId/execute")
	@Middleware(upload.any())
	@Middleware(validate(ExecuteTarget))
	@Middleware(upload.any())
	@Middleware(validate(ExecuteTarget))
	public async executeTarget(
		req: IRequest<ExecuteTarget, {}, { targetId: string }>,
		res: IResponse,
	) {
		const handled = await targetPreHandler(req, res);
		const handled = await targetPreHandler(req, res);

		if (handled !== true) {
			return;
		if (handled !== true) {
			return;
		}

		const target = await fetchTarget(req.params.targetId);

		if (!target) {
			return res.error!("not_found");
		}

		const subject =
			(target.subject_prefix ?? "") + (req.body.subjectPrefix ?? "") + req.body.subject;

		const replyTo = formatFromField(
			req.body.from ?? target.from,
			req.body.firstName,
			req.body.lastName,
		);

		let emailBody = req.body.body;

		if (target.allow_templates && req.body.template) {
			try {
				emailBody = await renderTemplate(req.body.template, req.body);
			} catch (e) {
				return res.error!("template_error");
			}
		}

		const files = req.files ? mapFiles(req.files) : undefined;

		try {
			await sendMail(target, replyTo, subject, emailBody, req.body.to, files);
		} catch (e) {
			if (target.error_redirect) {
				return res.redirect(getRedirectUrl(req, target.error_redirect));
			}
			return res.error!("operation_failed", [
				{ property: "*", constraints: { email: (e as Error).message } },
			]);
		}

		res.status(StatusCode.OK).end();
	}
}
