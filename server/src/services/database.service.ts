import { ETargetStatus, ETargetType, IDatabase, ITargetTable } from "$models/database.js";

import SQLite from "better-sqlite3";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import { config } from "./config.service.js";
import path from "path";
import { TargetAdd } from "$models/request/target.request.js";
import { generateKey, generateUniqueId } from "$utils/id.util.js";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser.js";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser.js";

export let db: Kysely<IDatabase>;

export function initDatabase() {
	const dbPath = path.join(config.db_path, "mailform.db");

	const dialect = new SqliteDialect({
		database: new SQLite(dbPath),
	});

	db = new Kysely<IDatabase>({ dialect, plugins: [new ParseJSONResultsPlugin()] });

	db.schema
		.createTable("targets")
		.ifNotExists()
		.addColumn("id", "varchar(16)", (cb) => cb.primaryKey().notNull())
		.addColumn("name", "varchar(128)", (cb) => cb.notNull())
		.addColumn("type", "integer", (cb) => cb.notNull())
		.addColumn("status", "integer", (cb) => cb.notNull())
		.addColumn("smtp", "text", (cb) => cb.notNull())
		.addColumn("recipients", "text", (cb) => cb.notNull())
		.addColumn("origin", "text")
		.addColumn("from", "text", (cb) => cb.notNull())
		.addColumn("subject_prefix", "text")
		.addColumn("allowFiles", "integer")
		.addColumn("ratelimit_timespan", "integer")
		.addColumn("ratelimit_requests", "integer")
		.addColumn("api_key", "text")
		.addColumn("success_redirect", "text")
		.addColumn("error_redirect", "text")
		.addColumn("captcha_provider", "integer")
		.addColumn("captcha_secret", "text")
		.execute()
		.then(() => console.log("[SQLite] Database loaded"));
}

export function getAllTargets() {
	return db.selectFrom("targets").selectAll().execute();
}

export function getTarget(id: string) {
	return db.selectFrom("targets").where("targets.id", "=", id).selectAll().executeTakeFirst();
}

export async function insertTarget(input: TargetAdd) {
	let target: InsertExpression<IDatabase, "targets"> = {
		id: generateUniqueId(),
		status: ETargetStatus.ENABLED,

		...input,
		allowFiles: input.allowFiles || 0,
		recipients: JSON.stringify(input.recipients),
	};

	if (input.type === ETargetType.API) {
		target.api_key = generateKey();
	}

	await db.insertInto("targets").values(target).execute();
}

export function deleteTarget(id: string) {
	return db.deleteFrom("targets").where("targets.id", "=", id).execute();
}

export function updateTarget(id: string, input: Partial<TargetAdd>) {
	let setter: UpdateObjectExpression<IDatabase, "targets", "targets"> = {
		...input,
		recipients: "",
	};

	if (input.recipients) {
		setter.recipients = JSON.stringify(input.recipients);
	} else {
		delete setter.recipients;
	}

	return db.updateTable("targets").set(setter).where("targets.id", "=", id).execute();
}
