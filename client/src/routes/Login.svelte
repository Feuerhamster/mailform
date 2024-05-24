<script lang="ts">
	import axios from "axios";
	import { authorizationKey } from "$lib/stores";
	import * as Card from "$lib/components/ui/card/index";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { toast } from "svelte-sonner";
	import { LoaderCircle } from "lucide-svelte";

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
			toast.error("Login failed");
			loading = false;
			return;
		}

		loading = false;
		toast.success("Successfully logged in");
		axios.defaults.headers.common.Authorization = "Bearer " + $authorizationKey;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl">Mailform</Card.Title>
		<Card.Description>Log in to your Mailform control panel</Card.Description>
	</Card.Header>
	<Card.Content>
		<form class="grid gap-4" on:submit|preventDefault={login}>
			<Label class="grid gap-2">
				Username
				<Input placeholder="Type your username" bind:value={loginData.username} />
			</Label>
			

			<Label class="grid gap-2">
				Password
				<Input placeholder="Type your password" type="password" bind:value={loginData.password} />
			</Label>

			<Button type="submit" disabled={loading}>
				{#if !loading}
					Log in
				{:else}
					<LoaderCircle class="animate-spin" />
				{/if}
			</Button>
		</form>
	</Card.Content>
</Card.Root>