import { RateLimiter } from "$services/ratelimiter.service.js";
import { fetchTarget } from "$services/target.service.js";
import { StatusCode } from "$types/httpStatusCodes.js";
import getRedirectUrl from "$utils/redirect.util.js";
import { IRequest, IResponse } from "express";
import { createHash } from "crypto";
import { EDatabaseBoolean, ETargetStatus } from "$models/database.js";

export async function targetPreHandler(
	req: IRequest<unknown, unknown, { targetId: string }>,
	res: IResponse,
) {
	const target = await fetchTarget(req.params.targetId);

	if (!target) {
		return res.error!("not_found");
	}

	// CORS
	res.setHeader("Access-Control-Allow-Origin", target.origin ? target.origin : "*");
	res.setHeader("Access-Control-Allow-Method", "POST");
	res.setHeader("Access-Control-Allow-Headers", "*");

	if (req.method === "OPTIONS") {
		return res.status(StatusCode.OK).end();
	}

	if (target.status === ETargetStatus.DISABLED) {
		if (target.error_redirect) {
			return res.redirect(getRedirectUrl(req, target.error_redirect));
		}
		return res.error!("access_denied");
	}

	// Check files
	if (target.allow_files === EDatabaseBoolean.FALSE && req.files) {
		if (target.error_redirect) {
			return res.redirect(getRedirectUrl(req, target.error_redirect));
		}
		return res.error!("no_files_allowed");
	}

	// Check origin
	if (target.origin && target.origin !== req.header("origin")) {
		if (target.error_redirect) {
			return res.redirect(getRedirectUrl(req, target.error_redirect));
		}
		return res.error!("access_denied");
	}

	// Authentication
	if (target.api_key) {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.error!("unauthorized");
		}

		const bearer = /Bearer (.+)/.exec(authHeader);

		if (!bearer || bearer[1] !== target.api_key) {
			if (target.error_redirect) return res.redirect(getRedirectUrl(req, target.error_redirect));
			return res.error!("unauthorized");
		}
	}

	if (target.ratelimit_timespan && target.ratelimit_requests) {
		RateLimiter.registerTarget(target.id, target.ratelimit_timespan, target.ratelimit_requests);
	}

	if (!req.ip) {
		if (target.error_redirect) return res.redirect(getRedirectUrl(req, target.error_redirect));
		return res.error!("action_not_allowed");
	}

	const ipHash = createHash("sha256").update(req.ip).digest("hex");

	// Check rate limit
	if (!(await RateLimiter.consume(req.params.targetId, ipHash))) {
		return res.status(429).end();
	}

	return true;
}
