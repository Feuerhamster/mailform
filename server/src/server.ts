import { Server } from "@overnightjs/core";
import express from "express";
import { Server as HttpServer } from "http";
import cors from "cors";
import { config } from "$services/config.service.js";
import { errorFunctionMiddleware } from "$middlewares/errorFunction.middleware.js";

export default class MailformServer extends Server {
	private server!: HttpServer;

	constructor() {
		super(process.env.NODE_ENV === "development");

		this.app.set("trust proxy", config.proxy);
		this.app.use(express.json());
		this.app.use(cors());
		this.app.use(errorFunctionMiddleware);
		this.setupControllers();
	}

	private async setupControllers(): Promise<void> {
		// Dynamic imports are required here to load these modules after the config has been loaded.
		const DefaultController = (await import("./controllers/default.controller.js")).default;
		const AuthController = (await import("./controllers/auth.controller.js")).default;
		const TargetController = (await import("./controllers/target.controller.js")).default;
		const TemplateController = (await import("./controllers/template.controller.js")).default;

		super.addControllers([new DefaultController()]);
		super.addControllers([new AuthController()]);
		super.addControllers([new TargetController()]);
		super.addControllers([new TemplateController()]);
	}

	public start(port: number): void {
		this.server = this.app.listen(port, () => {
			console.log("[express] Server running on " + port);
		});
	}

	public stop(): void {
		this.server.close();
		console.log("[express] Server stopped");
	}
}
