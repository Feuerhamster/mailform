<script lang="ts">
	import Box from "$lib/Box.svelte";
	import Button from "$lib/Button.svelte";
	import Form from "$lib/Forms/Form.svelte";
	import Input from "$lib/Forms/Input.svelte";
	import axios from "axios";
	import { pushToast } from "./Toasts.svelte";
	import { isLoggedIn } from "$lib/stores";

	let loading = false;

	let loginData = {
		username: "",
		password: ""
	}
	
	async function login() {
		loading = true;

		try {
			await axios.post("/auth/login", loginData);
		} catch(e) {
			pushToast("Login failed", "error");
			loading = false;
			return;
		}

		loading = false;
		pushToast("Login success", "success");
		$isLoggedIn = true;
	}
</script>

<Box>
	<h1>Mailform</h1>
	<h2>Login</h2>
	<Form on:submit={login}>
		<Input placeholder="Username" required bind:value={loginData.username} />
		<Input placeholder="Password" type="password" required bind:value={loginData.password} />
		<Button {loading}>Log in</Button>
	</Form>
</Box>

<style lang="scss">
	h1, h2 {
		margin: 0;
	}

	h1 {
		font-weight: 600;
	}

	h2 {
		font-weight: 500;
	}
</style>