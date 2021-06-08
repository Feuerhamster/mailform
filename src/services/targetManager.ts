import {Target} from "../@types/target";
import fs from "fs";
import path from "path";
import {RateLimiter} from "./rateLimiter";
import {EmailService} from "./email";
import validate from "validate.js";
import {targetModel} from "../models/target";

export class TargetManager {

    public static targets: Map<string, Target> = new Map<string, Target>();

    private static path: string = process.env.TARGETS_DIR ?? "targets";

    /**
     * Load all targets from the targets directory
     */
    public static load(): void {

        let targets: string[];

        console.log("Loading targets...");

        try {
            targets = fs.readdirSync(this.path);
        } catch (e) {
            throw new Error("Cannot load targets" + e);
        }

        targets = targets.filter((file) => file.endsWith(".json"));

        for(let targetFileName of targets) {

            let target: any = JSON.parse(fs.readFileSync(path.join(this.path, targetFileName)).toString())

            let targetName = path.basename(targetFileName, path.extname(targetFileName));

            this.validateTarget(targetName, target);

            console.log("* Loaded target: " + targetName);

            this.targets.set(targetName, <Target>target);


            RateLimiter.registerTarget(targetName, target.rateLimit);
            EmailService.registerTarget(targetName, target.smtp);

        }

    }

    /**
     * Validate a target file object and cancel the program if there are errors.
     * @param targetName (file-)name of the target
     * @param target The target object
     * @private
     */
    private static validateTarget(targetName: string, target: Target): void {

        let validationErrors = validate.validate(target, targetModel, {format: "detailed"})

        if(validationErrors === undefined ) return;

        console.error("Error: Target " + targetName + " is invalid!");

        for(let err of validationErrors) {
            console.error(err.error);
        }

        process.exit(-1);

    }

}