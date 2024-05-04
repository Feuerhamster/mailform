import { Controller, Head } from "@overnightjs/core";
import { IRequest, IResponse } from "express";
import { StatusCode } from "$types/httpStatusCodes";

@Controller("/")
export default class DefaultController {
	@Head("/")
	public onlineCheck(req: IRequest, res: IResponse<string>) {
		res.status(StatusCode.OK).end();
	}
}
