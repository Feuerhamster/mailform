import {NextFunction, Request, Response, Router} from "express";
import formidable from "formidable";
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

router.post("/:target", async (req: Request, res: Response) => {

    // Check rate limit
    if(!await RateLimiter.consume(req.params.target, req.ip)) {
        return res.status(429).end();
    }

    let target: Target = TargetManager.targets.get(req.params.target);

    // parse form
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
        if (err) {
            if(target.redirect?.error) return res.redirect(target.redirect.error);
            return res.status(400).send({ message: "Parse Error" }).end();
        } else {
            const validationResult = validate(fields, postBody);

            // validate fields
            if(validationResult.error) {
                return res.status(422).json(validationResult);
            }

            // Check captcha
            if(target.captcha) {
                let userCaptchaResponse = fields["g-recaptcha-response"] || fields["h-captcha-response"] || null;
                userCaptchaResponse = userCaptchaResponse instanceof Array ? userCaptchaResponse[0] : userCaptchaResponse
                let verified = await CaptchaService.verifyCaptcha(target.captcha, userCaptchaResponse);

                if(!verified) {
                    if(target.redirect?.error) return res.redirect(target.redirect.error);
                    return res.status(400).send({ message: "captcha verification failed" }).end();
                }
            }

            // extract fields
            const fieldFrom = fields["from"] instanceof Array ? fields["from"][0] : fields["from"]
            const fieldFirstName = fields["firstName"] instanceof Array ? fields["firstName"][0] : fields["firstName"]
            const fieldLastName = fields["lastName"] instanceof Array ? fields["lastName"][0] : fields["lastName"]
            const fieldSubject = fields["subject"] instanceof Array ? fields["subject"][0] : fields["subject"]
            const fieldBody = fields["body"] instanceof Array ? fields["body"][0] : fields["body"]

            // send email
            let from = EmailService.formatFromField(fieldFrom ?? target.from, fieldFirstName, fieldLastName);
            let sent = await EmailService.sendMail(req.params.target, from, fieldSubject, fieldBody, files);

            if(sent instanceof Error || !sent) {
                if(target.redirect?.error) return res.redirect(target.redirect.error);
                return res.status(500).send({ message: (<Error>sent).message }).end();
            }

            if(target.redirect?.success) {
                return res.redirect(target.redirect.success);
            }

            return res.status(200).end();
        }
    });
});

router.all("*", (req: Request, res: Response) => res.status(404).end());

export default router;