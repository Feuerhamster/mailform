import crypto from "crypto";

const secret = randomString();

export function randomString() {
	let buff = crypto.randomBytes(16);

	return buff.toString("hex");
}

export function sign(key?: string) {
	if (!key) {
		key = randomString();
	}

	const hash = crypto.createHmac("sha256", secret).update(key).digest("hex");

	return key + "." + hash;
}

/**
 * Verify a token
 * @param token
 * @return {boolean}
 */
export function verify(token: string) {
	let key = token.split(".")[0];

	let checkToken = sign(key);

	return token === checkToken;
}
