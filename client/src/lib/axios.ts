import { dev } from "$app/environment";
import axios from "axios";
import { get } from "svelte/store";
import { authorizationKey } from "./stores";
import { goto } from "$app/navigation";

axios.defaults.baseURL = dev ? "http://localhost:5000/" : "/api/";
axios.defaults.headers.common.Authorization = "Bearer " + get(authorizationKey);

export function logOut() {
	authorizationKey.delete();
	axios.defaults.headers.common.Authorization = "";
	goto("/");
}

axios.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err?.response?.status === 401) {
			logOut();
		}

		return Promise.reject(err);
	},
);
