import {
	ETargetStatus,
	IDatabase,
	ITargetTable,
	NewTemplate,
	TargetUpdate,
	TemplateUpdate,
} from "$models/database.js";

import SQLite from "better-sqlite3";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import { config } from "./config.service.js";
import path from "path";
import { TargetAdd } from "$models/request/target.request.js";
import { generateKey, generateUniqueId } from "$utils/id.util.js";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser.js";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser.js";
import { TemplateAdd } from "$models/request/template.request.js";

export let db: Kysely<IDatabase>;

export async function initDatabase() {
	const dbPath = path.join(config.db_path, "mailform.db");

	const dialect = new SqliteDialect({
		database: new SQLite(dbPath),
	});

	db = new Kysely<IDatabase>({ dialect, plugins: [new ParseJSONResultsPlugin()] });

	await db.schema
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
		.addColumn("allow_files", "integer")
		.addColumn("allow_templates", "integer")
		.addColumn("ratelimit_timespan", "integer")
		.addColumn("ratelimit_requests", "integer")
		.addColumn("api_key", "text")
		.addColumn("success_redirect", "text")
		.addColumn("error_redirect", "text")
		.addColumn("captcha_provider", "integer")
		.addColumn("captcha_secret", "text")
		.execute();

	await db.schema
		.createTable("templates")
		.addColumn("id", "varchar(16)", (cb) => cb.primaryKey().notNull())
		.addColumn("name", "varchar(128)", (cb) => cb.notNull())
		.addColumn("template", "text", (cb) => cb.notNull())
		.ifNotExists()
		.execute();

	console.log("[SQLite] Database loaded");
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
		allow_files: input.allow_files || 0,
		allow_templates: input.allow_templates || 0,
		recipients: JSON.stringify(input.recipients),
	};

	target.api_key = generateKey();

	await db.insertInto("targets").values(target).execute();
}

export function deleteTarget(id: string) {
	return db.deleteFrom("targets").where("targets.id", "=", id).execute();
}

export function updateTarget(id: string, input: TargetUpdate) {
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

export function listAllTemplates() {
	return db.selectFrom("templates").select(["id", "name"]).execute();
}

export function getTemplate(id: string) {
	return db.selectFrom("templates").where("templates.id", "=", id).selectAll().executeTakeFirst();
}

export async function insertTemplate(input: TemplateAdd) {
	const template: NewTemplate = {
		id: generateUniqueId(),
		name: input.name,
		template: input.template,
	};

	await db.insertInto("templates").values(template).execute();
}

export function updateTemplate(id: string, input: TemplateUpdate) {
	return db.updateTable("templates").set(input).where("templates.id", "=", id).execute();
}

export function deleteTemplate(id: string) {
	return db.deleteFrom("templates").where("templates.id", "=", id).execute();
}
