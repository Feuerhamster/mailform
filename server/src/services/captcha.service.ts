import { ECaptchaProvider } from "$models/database.js";
import axios from "axios";

export async function verifyCaptcha(
	captcha: ECaptchaProvider,
	secret: string,
	userCaptchaResponse: string,
): Promise<boolean> {
	let url: string;

	switch (captcha) {
		case ECaptchaProvider.RECAPTCHA:
			url = "https://www.google.com/recaptcha/api/siteverify";
			break;
		case ECaptchaProvider.HCAPTCHA:
			url = "https://hcaptcha.com/siteverify";
			break;
		default:
			throw new Error("invalid captcha provider");
	}

	const qs = new URLSearchParams();
	qs.set("secret", secret);
	qs.set("response", userCaptchaResponse);

	const res = await axios.post(url, qs.toString());

	return res.data.success;
}
