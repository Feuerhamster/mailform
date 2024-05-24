<script>
	import "../app.css";
	import "@fontsource/atkinson-hyperlegible";
	import Login from "./Login.svelte";
	import Toasts from "./Toasts.svelte";
	import { authorizationKey } from "$lib/stores";
	import "$lib/axios";import Navbar from "$lib/Navbar.svelte";
;
</script>

<main>
	{#if $authorizationKey}
		<Navbar />
		<slot></slot>
	{:else}
		<section class="center">
			<Login></Login>
		</section>
	{/if}

</main>

<Toasts />

<style lang="scss">
	@import "../scss/colors.scss";

	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		font-family: "Atkinson Hyperlegible", sans-serif;
		font-size: 18px;
		color: var(--color-text);
	}

	:global(body) {
		margin: 0;
		min-height: 100vh;
		background-color: var(--color-bg);
	}

	main {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 8px;
		align-items: center;
	}

	section {
		display: flex;
		flex-direction: column;
		flex: 1;

		&.center {
			align-items: center;
			justify-content: center;
		}
	}
</style>