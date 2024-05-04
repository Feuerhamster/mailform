import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

export function generateUniqueId() {
	return nanoid(16);
}

export function generateKey() {
	return nanoid(32);
}
