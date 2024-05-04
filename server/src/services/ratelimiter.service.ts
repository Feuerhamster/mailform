import { RateLimiterMemory } from "rate-limiter-flexible";

export class RateLimiter {
	private static limiters: Map<string, RateLimiterMemory> = new Map<string, RateLimiterMemory>();

	/**
	 * Register a target in the rate limiter service
	 * @param targetName Name of the target
	 * @param limits Rate limit configuration for target
	 */
	public static registerTarget(targetId: string, timespan: number, requests: number): void {
		if (this.limiters.has(targetId)) {
			return;
		}

		this.limiters.set(
			targetId,
			new RateLimiterMemory({
				duration: timespan,
				points: requests,
			}),
		);
	}

	/**
	 * Consume one point of a target's rate limiter
	 * @param target (file-)name of a target
	 * @param identifier Rate limiter identifier (ip address)
	 */
	public static async consume(targetId: string, identifier: string): Promise<boolean> {
		let rateLimiter = this.limiters.get(targetId);

		if (!rateLimiter) return true;

		try {
			await rateLimiter.consume(identifier, 1);
		} catch (e) {
			return false;
		}

		return true;
	}
}
