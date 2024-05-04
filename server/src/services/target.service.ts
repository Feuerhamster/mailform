import { Target } from "$models/database.js";
import NodeCache from "node-cache";
import { getTarget } from "./database.service.js";

const cache = new NodeCache({ stdTTL: 3600 });

export async function fetchTarget(targetId: string): Promise<Target | null> {
	const cachedTarget = cache.get<Target>(targetId);

	if (cachedTarget) {
		return cachedTarget;
	}

	const target = await getTarget(targetId);

	if (target) {
		cache.set<Target>(targetId, target);
	}

	return target ? target : null;
}
