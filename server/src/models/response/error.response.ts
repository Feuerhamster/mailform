import { StatusCode } from "$types/httpStatusCodes";

export const responseErrorCodes = {
	login_failed: StatusCode.BadRequest,
	validation_error: StatusCode.UnprocessableEntity,
	invalid_authorization: StatusCode.Unauthorized,
	unauthorized: StatusCode.Unauthorized,
	not_found: StatusCode.NotFound,
	operation_failed: StatusCode.InternalServerError,
	conflict: StatusCode.Conflict,
	action_not_allowed: StatusCode.Forbidden,
	access_denied: StatusCode.Forbidden,
	no_files_allowed: StatusCode.BadRequest,
	template_error: StatusCode.BadRequest,
} as const;

export type ResponseErrorCode = keyof typeof responseErrorCodes;
