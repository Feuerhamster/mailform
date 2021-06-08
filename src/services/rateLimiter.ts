import {RateLimiterMemory} from "rate-limiter-flexible";
import {TargetRateLimit} from "../@types/target";

export class RateLimiter {

    private static limiters: Map<string, RateLimiterMemory> = new Map<string, RateLimiterMemory>();

    /**
     * Register a target in the rate limiter service
     * @param targetName Name of the target
     * @param limits Rate limit configuration for target
     */
    public static registerTarget(targetName: string, limits: TargetRateLimit): void {

        this.limiters.set(targetName, new RateLimiterMemory({
            duration: limits.timespan,
            points: limits.requests
        }));

    }

    /**
     * Consume one point of a target's rate limiter
     * @param target (file-)name of a target
     * @param identifier Rate limiter identifier (ip address)
     */
    public static async consume(target, identifier): Promise<boolean> {

        let rateLimiter: RateLimiterMemory = this.limiters.get(target);

        if(!rateLimiter) return false;

        try {
            await rateLimiter.consume(identifier, 1);
        } catch (e) {
            return false;
        }

        return true;
    }

}