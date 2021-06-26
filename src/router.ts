import {NextFunction, Request, Response, Router} from "express";
import {TargetManager} from "./services/targetManager";
import {Target} from "./@types/target";
import {RateLimiter} from "./services/rateLimiter";
import validate from "./services/validate";
import {postBody} from "./models/post";
import {EmailService} from "./services/email";
import {CaptchaService} from "./services/captcha";

const router: Router = Router();

/**
 * Check if target exist, validate origin and send CORS headers.
 */
router.use("/:target", async (req: Request, res: Response, next: NextFunction) => {

    // Check if target exist
    if(!TargetManager.targets.has(req.params.target)) {
        return res.send(404);
    }

    let target: Target = TargetManager.targets.get(req.params.target);

    // CORS
    res.setHeader("Access-Control-Allow-Origin", target.origin ? target.origin : "*");
    res.setHeader("Access-Control-Allow-Method", "POST");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if(req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Check origin
    if(target.origin && target.origin !== req.header("origin")) {
        if(target.redirect?.error) return res.redirect(target.redirect.error);
        return res.status(403).end();
    }

    // Authentication
    if(target.key) {
        let bearer = /Bearer (.+)/.exec(req.headers.authorization);

        if(!bearer || bearer[1] !== target.key) {
            if(target.redirect?.error) return res.redirect(target.redirect.error);
            return res.status(401).end();
        }
    }

    return next();

});

router.post("/:target", validate(postBody), async (req: Request, res: Response) => {

    // Check rate limit
    if(!await RateLimiter.consume(req.params.target, req.ip)) {
        return res.status(429).end();
    }

    let target: Target = TargetManager.targets.get(req.params.target);

    // Check captcha
    if(target.captcha) {
        let userCaptchaResponse = req.body["g-recaptcha-response"] || req.body["h-captcha-response"] || null;
        let verified = await CaptchaService.verifyCaptcha(target.captcha, userCaptchaResponse);

        if(!verified) {
            if(target.redirect?.error) return res.redirect(target.redirect.error);
            return res.status(400).send({ message: "captcha verification failed" }).end();
        }
    }

    // send email
    let from = EmailService.formatFromField(req.body.from ?? target.from, req.body.firstName, req.body.lastName);
    let sent = await EmailService.sendMail(req.params.target, from, req.body.subject, req.body.body);

    if(sent instanceof Error || !sent) {
        if(target.redirect?.error) return res.redirect(target.redirect.error);
        return res.status(500).send({ message: (<Error>sent).message }).end();
    }

    if(target.redirect?.success) {
        return res.redirect(target.redirect.success);
    }

    res.status(200).end();

});

router.all("*", (req: Request, res: Response) => res.status(404).end());

export default router;