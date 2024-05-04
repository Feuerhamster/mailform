import ShoppyV2Server from "./server.js";
import cleanup from "node-cleanup";

// Start server
const server = new ShoppyV2Server();

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

server.start(port);

cleanup(() => {
	server.stop();
	console.log("Application shutdown successful");
});
