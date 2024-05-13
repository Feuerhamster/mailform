<script>
	import "../app.css";
	import "@fontsource/atkinson-hyperlegible";
	import Login from "./Login.svelte";
	import { authorizationKey } from "$lib/stores";
	import "$lib/axios";
	import { Toaster } from "$lib/components/ui/sonner";
	import Navbar from "$lib/Navbar.svelte";
</script>

{#if $authorizationKey}
	<Navbar />
	<div class="flex flex-col items-center gap-8 p-8">
		<slot></slot>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<Login></Login>
	</div>
{/if}

<Toaster position="bottom-center" />
