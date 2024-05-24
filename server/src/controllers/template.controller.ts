import { Controller, Middleware, Get, Post, Delete, Put } from "@overnightjs/core";
import { IRequest, IResponse } from "express";
import authenticate from "$middlewares/auth.middleware.js";
import {
	deleteTemplate,
	insertTemplate,
	listAllTemplates,
	updateTemplate,
} from "$services/database.service.js";
import validate, { validateOptional } from "$middlewares/validation.middleware.js";
import { StatusCode } from "$types/httpStatusCodes.js";
import { TemplateAdd } from "$models/request/template.request.js";
import { validateTemplateSyntax } from "$services/template.service.js";

@Controller("templates")
export default class AuthController {
	@Get("/")
	@Middleware(authenticate)
	public async getTargets(req: IRequest, res: IResponse) {
		const templates = await listAllTemplates();
		res.send(templates);
	}

	@Post("/")
	@Middleware(authenticate)
	@Middleware(validate(TemplateAdd))
	public async createTarget(req: IRequest<TemplateAdd>, res: IResponse) {
		if (validateTemplateSyntax(req.body.template)) {
			res.error!("validation_error", [
				{
					property: "template",
					constraints: { parse_error: "Template could not be parsed. Probably syntax error." },
				},
			]);
			return;
		}

		await insertTemplate(req.body);

		res.status(StatusCode.OK).end();
	}

	@Put(":templateId")
	@Middleware(authenticate)
	@Middleware(validateOptional(TemplateAdd))
	public async updateTarget(
		req: IRequest<TemplateAdd, {}, { templateId: string }>,
		res: IResponse,
	) {
		if (validateTemplateSyntax(req.body.template)) {
			res.error!("validation_error", [
				{
					property: "template",
					constraints: { parse_error: "Template could not be parsed. Probably syntax error." },
				},
			]);
			return;
		}

		try {
			await updateTemplate(req.params.templateId, req.body);
		} catch (e) {
			res.error!("operation_failed");
			return;
		}

		res.status(StatusCode.OK).end();
	}

	@Delete(":templateId")
	@Middleware(authenticate)
	public async deleteTarget(req: IRequest<{}, {}, { templateId: string }>, res: IResponse) {
		try {
			await deleteTemplate(req.params.templateId);
		} catch (e) {
			res.error!("operation_failed");
			return;
		}

		res.status(StatusCode.OK).end();
	}
}
