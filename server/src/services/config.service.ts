import dotenv from "dotenv";

export let config = {
	port: 5000,
	proxy: true,
	db_path: "./database/",
	username: "",
	password: "",
};

export function loadConfig() {
	dotenv.config();

	if (process.env.PORT) {
		config.port = parseInt(process.env.PORT);
	}

	if (process.env.DB_PATH) {
		config.db_path = process.env.DB_PATH;
	}

	if (!process.env.ROOT_USERNAME || !process.env.ROOT_PASSWORD) {
		throw new Error("No user provided in env variables");
	}

	config.username = process.env.ROOT_USERNAME;
	config.password = process.env.ROOT_PASSWORD;

	if (process.env.PROXY) {
		config.proxy = Boolean(process.env.PROXY);
	}
}
