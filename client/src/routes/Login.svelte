<script lang="ts">
	import axios from "axios";
	import { authorizationKey } from "$lib/stores";
	import Box from "$lib/Box.svelte";
	import Input from "$lib/Input.svelte";
	import Button from "$lib/Button.svelte";
	import { pushToast } from "./Toasts.svelte";

	let loading = false;

	let loginData = {
		username: "",
		password: ""
	}
	
	async function login() {
		loading = true;

		try {
			const res = await axios.post("/auth/login", loginData);
			authorizationKey.set(res.data);
		} catch(e) {
			pushToast("Login failed", "error");
			loading = false;
			return;
		}

		loading = false;
		pushToast("Login successful", "success");
		axios.defaults.headers.common.Authorization = "Bearer " + $authorizationKey;
	}
</script>

<Box>
	<svelte:fragment slot="header">
		<img src="/favicon.png" alt="envelope" />
		<h1>Mailform</h1>
	</svelte:fragment>
	<form on:submit|preventDefault={login}>
		<h2>Log in to the admin panel</h2>

		<Input type="text" placeholder="Username" required bind:value={loginData.username} />
		<Input type="password" placeholder="Password" required bind:value={loginData.password} />

		<Button type="submit">Login</Button>
	</form>
</Box>

<style lang="scss">
	h1 {
		margin: 0;
		font-size: 2rem;
	}

	h2 {
		margin: 0;
		padding-left: 4px;
		font-size: 1rem;
		font-weight: 500;
	}

	img {
		height: 2rem;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.6rem;
	}
</style>