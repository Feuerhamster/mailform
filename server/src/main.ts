import { config, loadConfig } from "$services/config.service.js";
import { initDatabase } from "$services/database.service.js";
import MailformServer from "./server.js";
import cleanup from "node-cleanup";

// load config
loadConfig();

// init database
initDatabase();

// Start server
const server = new MailformServer();
server.start(config.port);

cleanup(() => {
	server.stop();
	console.log("Application shutdown successful");
});
