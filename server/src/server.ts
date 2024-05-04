import { Server } from "@overnightjs/core";
import express from "express";
import { Server as HttpServer } from "http";
import cors from "cors";

export default class ShoppyV2Server extends Server {
	private server!: HttpServer;

	constructor() {
		super(process.env.NODE_ENV === "development");

		this.app.set("trust proxy", true);
		this.setupControllers();
	}

	private async setupControllers(): Promise<void> {
		// Dynamic imports are required here to load these modules after the config has been loaded.
		const DefaultController = (await import("./controllers/default.controller.js")).default;

		super.addControllers([new DefaultController()]);
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