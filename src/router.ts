import {HttpStatusCode} from 'axios';
import {NextFunction, Request, Response, Router} from 'express';
import formidable from 'formidable';
import {ContactForm, Target} from './@types/target';
import {postBody} from './models/post';
import {CaptchaService} from './services/captcha';
import {EmailService} from './services/email';
import {RateLimiter} from './services/rateLimiter';
import {TargetManager} from './services/targetManager';
import validate from './services/validate';
import getRedirectUrl from './util/redirect';

const router: Router = Router();

if (process.env.ENABLE_PIPEDRIVE) {
    const {PipedriveService} = require('./services/pipedrive');
    const pipedriveTarget = 'pipedrive-contact-form';

    RateLimiter.registerTarget(pipedriveTarget, {
        requests: 3,
        timespan: 300,
    });

    router.post('/pipe/contact-form', async (req: Request, res: Response) => {
        try {
            // TODO activate this
            // if (!(await RateLimiter.consume(pipedriveTarget, req.ip))) {
            //     return res.status(429).end();
            // }
            console.info('[POST] /contact-form');

            // CORS
            res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
            res.setHeader('Access-Control-Allow-Headers', '*');

            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }

            const form = formidable({});
            form.parse(req, async (err, fields, _) => {
                if (err) {
                    return res.status(HttpStatusCode.InternalServerError).send({message: 'Parse Error'}).end();
                }
                const service = new PipedriveService();
                let data: ContactForm;

                try {
                    data = service.validateContactForm(fields);
                } catch (error) {
                    return res.status(HttpStatusCode.BadRequest).json({message: (error as Error).message});
                }

                try {
                    const response = await service.createAllPipedriveItemsForContactForm(data);
                    console.info(`response form createAllPipedriveItemsForContactForm -> ${JSON.stringify(response)}`);
                    if (response.success) res.status(HttpStatusCode.Created).json({data: response.data});
                    else res.status(HttpStatusCode.BadRequest).json(response);
                } catch (error) {
                    return res.status(HttpStatusCode.InternalServerError).json({message: (error as Error).message});
                }
            });
        } catch (e: any) {
            console.error('[POST] /contact-form -> ERROR: unhandled exception ist happened');
            console.error(e);
            res.status(HttpStatusCode.InternalServerError).json(e);
        }
    });
}

/**
 * Check if target exist, validate origin and send CORS headers.
 */
router.use('/:target', async (req: Request, res: Response, next: NextFunction) => {
    // Check if target exist
    if (!TargetManager.targets.has(req.params.target)) {
        return res.sendStatus(404);
    }

    //@ts-ignore
    let target: Target = TargetManager.targets.get(req.params.target);

    // CORS
    res.setHeader('Access-Control-Allow-Origin', target.origin ? target.origin : '*');
    res.setHeader('Access-Control-Allow-Method', 'POST');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check origin
    if (target.origin && target.origin !== req.header('origin')) {
        if (target.redirect?.error) return res.redirect(getRedirectUrl(req, target.redirect.error));
        return res.status(403).end();
    }

    // Authentication
    if (target.key) {
        // @ts-ignore
        let bearer = /Bearer (.+)/.exec(req.headers.authorization);

        if (!bearer || bearer[1] !== target.key) {
            if (target.redirect?.error) return res.redirect(getRedirectUrl(req, target.redirect.error));
            return res.status(401).end();
        }
    }

    return next();
});

router.post('/:target', async (req: Request, res: Response) => {
    // Check rate limit
    if (!(await RateLimiter.consume(req.params.target, req.ip))) {
        return res.status(429).end();
    }

    // @ts-ignore
    let target: Target = TargetManager.targets.get(req.params.target);

    // parse form
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
        if (err) {
            if (target.redirect?.error) return res.redirect(getRedirectUrl(req, target.redirect.error));
            return res.status(500).send({message: 'Parse Error'}).end();
        } else {
            // sendEmail is a honeypot for bots
            if (fields['sendEmail']) {
                console.info('Honeypot field sendEmail was filled out. * time: ' + new Date().toString());
                if (target.redirect?.error) return res.redirect(target.redirect.error);
                return res.status(400).send({message: 'human verification failed'}).end();
            }
            const validationResult = validate(fields, postBody);

            // validate fields
            if (validationResult.error) {
                return res.status(422).json(validationResult);
            }

            // Check captcha
            if (target.captcha) {
                let userCaptchaResponse = fields['g-recaptcha-response'] || fields['h-captcha-response'] || null;
                userCaptchaResponse =
                    userCaptchaResponse instanceof Array ? userCaptchaResponse[0] : userCaptchaResponse;
                //@ts-ignore
                let verified = await CaptchaService.verifyCaptcha(target.captcha, userCaptchaResponse);

                if (!verified) {
                    if (target.redirect?.error) return res.redirect(getRedirectUrl(req, target.redirect.error));
                    return res.status(400).send({message: 'captcha verification failed'}).end();
                }
            }

            // extract fields
            const fieldFrom = fields['from'] instanceof Array ? fields['from'][0] : fields['from'];
            const fieldFirstName = fields['firstName'] instanceof Array ? fields['firstName'][0] : fields['firstName'];
            const fieldLastName = fields['lastName'] instanceof Array ? fields['lastName'][0] : fields['lastName'];
            const fieldSubjectPrefix =
                fields['subjectPrefix'] instanceof Array ? fields['subjectPrefix'][0] : (fields['subjectPrefix'] ?? '');
            const subject =
                (target.subjectPrefix ?? '') +
                fieldSubjectPrefix +
                (fields['subject'] instanceof Array ? fields['subject'][0] : fields['subject']);
            const fieldBody = fields['body'] instanceof Array ? fields['body'][0] : fields['body'];

            // send email
            let from = EmailService.formatFromField(fieldFrom ?? target.from, fieldFirstName, fieldLastName);
            let sent = await EmailService.sendMail(req.params.target, from, subject, fieldBody, files);

            if (sent instanceof Error || !sent) {
                if (target.redirect?.error) return res.redirect(getRedirectUrl(req, target.redirect.error));
                return res
                    .status(500)
                    .send({message: (<Error>sent).message})
                    .end();
            }

            if (target.redirect?.success) {
                return res.redirect(getRedirectUrl(req, target.redirect.success));
            }

            // return res.status(200).end();
            return res.send({message: 'tutto bene mailissimo! 🤠'}).status(200).end();
        }
    });
});

router.all('*', (req: Request, res: Response) => res.status(404).end());

export default router;
