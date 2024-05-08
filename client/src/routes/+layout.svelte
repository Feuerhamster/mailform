<script lang="ts">
	import Navbar from "$lib/Navbar.svelte";
	import "@fontsource/lexend/500.css";
	import "@fontsource/lexend/600.css";
	import "@fontsource/lexend/700.css";
	import Login from "./Login.svelte";
	import { isLoggedIn } from "$lib/stores";
	import "$lib/axios";
	import Toasts from "./Toasts.svelte";
</script>


{#if $isLoggedIn}
	<Navbar/>

	<slot />
{:else}
	<div class="center">
		<Login />
	</div>
{/if}

<Toasts />

<style lang="scss">
	@import "../scss/colors.scss";
	@import "../scss/defaults.scss";

	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		font-size: 18px;
		font-family: "Lexend Variable", sans-serif;
		color: var(--color-text);
		font-weight: 500;
		letter-spacing: 0.2px;
	}

	:global(body) {
		background-color: var(--color-bg);
		display: flex;
		height: 100vh;
		margin: 0;
		user-select: none;



		:global(main) {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			padding: var(--default-spacing-page);
			gap: var(--default-spacing-page);
		}
	}

	.center {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--default-spacing-page);
		flex: 1;
	}
</style>