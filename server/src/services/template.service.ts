import { Liquid } from "liquidjs";
import { getTemplate } from "./database.service";

const liquidEngine = new Liquid();

export function validateTemplateSyntax(template: string): boolean {
	try {
		liquidEngine.parse(template);
		return true;
	} catch (e) {
		return false;
	}
}

export async function renderTemplate(id: string, data: Object): Promise<string> {
	const templateRow = await getTemplate(id);

	if (!templateRow) {
		throw new Error("Template not found");
	}

	return liquidEngine.parseAndRender(templateRow.template, data);
}
