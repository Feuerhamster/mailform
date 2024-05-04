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
import { RateLimiter } from "$services/ratelimiter.service.js";
import { createHash } from "crypto";
import { fetchTarget } from "$services/target.service.js";
import formidable from "formidable";
import getRedirectUrl from "$utils/redirect.util.js";
import { formatFromField } from "$utils/formatFromField.util.js";
import { sendMail } from "$services/email.service.js";

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

	@Post(":targetId/execute")
	public async executeTarget(
		req: IRequest<ExecuteTarget, {}, { targetId: string }>,
		res: IResponse,
	) {
		await targetPreHandler(req, res);

		if (!req.ip) {
			return res.error!("action_not_allowed");
		}

		const ipHash = createHash("sha256").update(req.ip).digest("hex");

		// Check rate limit
		if (!(await RateLimiter.consume(req.params.targetId, ipHash))) {
			return res.status(429).end();
		}

		const target = await fetchTarget(req.params.targetId);

		if (!target) {
			return res.error!("not_found");
		}

		const form = formidable({});

		let fields: formidable.Fields<string>;
		let files: formidable.Files<string>;

		try {
			[fields, files] = await form.parse(req);
		} catch (e) {
			if (target.error_redirect) {
				return res.redirect(getRedirectUrl(req, target.error_redirect));
			}
			return res.error!("operation_failed");
		}

		try {
			await validateStandalone(ExecuteTarget, req, res);
		} catch (e) {
			return;
		}

		// extract fields
		const fieldFrom = fields["from"] instanceof Array ? fields["from"][0] : fields["from"];
		const fieldFirstName =
			fields["firstName"] instanceof Array ? fields["firstName"][0] : fields["firstName"];
		const fieldLastName =
			fields["lastName"] instanceof Array ? fields["lastName"][0] : fields["lastName"];
		const fieldSubjectPrefix =
			fields["subjectPrefix"] instanceof Array
				? fields["subjectPrefix"][0]
				: fields["subjectPrefix"] ?? "";
		const subject =
			(target.subject_prefix ?? "") +
			fieldSubjectPrefix +
			(fields["subject"] instanceof Array ? fields["subject"][0] : fields["subject"]);
		const fieldBody = fields["body"] instanceof Array ? fields["body"][0] : fields["body"];

		const replyTo = formatFromField(fieldFrom ?? target.from, fieldFirstName, fieldLastName);

		try {
			await sendMail(target, replyTo, subject, fieldBody || "", files);
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
