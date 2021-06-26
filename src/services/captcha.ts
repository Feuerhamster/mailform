import axios from "axios";
import {CaptchaProvider, TargetCaptchaOptions} from "../@types/target";
import querystring from "querystring";

export class CaptchaService {

    static async verifyCaptcha(captcha: TargetCaptchaOptions, userCaptchaResponse: string): Promise<boolean> {
        let url;
        let res;

        switch (captcha.provider) {
            case CaptchaProvider.RECAPTCHA:
                url = "https://www.google.com/recaptcha/api/siteverify"
                break;
            case CaptchaProvider.HCAPTCHA:
                url = "https://hcaptcha.com/siteverify"
                break;
            default:
                break;
        }

        try {
            res = await axios.post(url,
                querystring.stringify({
                    secret: captcha.secret,
                    response: userCaptchaResponse
                })
            );
        } catch (e) {
            return false;
        }

        return res.data.success;
    }

}