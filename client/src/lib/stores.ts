import { writable } from "svelte/store";

function usePersistentStore(key: string) {
	const persistedData = sessionStorage.getItem(key);

	const { subscribe, set } = writable<string>(persistedData || "");

	return {
		subscribe,
		set: (data: string) => {
			sessionStorage.setItem(key, data);
			set(data);
		},
		delete: () => {
			sessionStorage.removeItem(key);
			set("");
		},
	};
}

export const authorizationKey = usePersistentStore("authorization");
