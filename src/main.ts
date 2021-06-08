import express, {Application} from "express";
import {Server} from "http";
import {AddressInfo} from "net";
import {TargetManager} from "./services/targetManager";
import routes from "./router";

// Start express app
const port = process.env.PORT || 0;
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load targets
TargetManager.load();

app.use(routes);

// Create server
const server: Server = app.listen(port, () => {
    let { port } = server.address() as AddressInfo;
    console.log("MailForm started on port " + port);
});