import {RateLimiterMemory} from "rate-limiter-flexible";
import {TargetRateLimit} from "../@types/target";

export class RateLimiter {

    private static limiters: Map<string, RateLimiterMemory> = new Map<string, RateLimiterMemory>();

    public static registerTarget(targetName: string, limits: TargetRateLimit): void {

        this.limiters.set(targetName, new RateLimiterMemory({
            duration: limits.timespan,
            points: limits.requests
        }));

    }

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