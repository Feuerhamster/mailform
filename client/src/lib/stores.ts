import { writable } from "svelte/store";

export const isLoggedIn = writable<boolean>(false);
