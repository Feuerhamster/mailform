<script>
	import "@fontsource/atkinson-hyperlegible";
	import Login from "./Login.svelte";
	import Toasts from "./Toasts.svelte";
	import { authorizationKey } from "$lib/stores";
	import "$lib/axios";
	import Navbar from "$lib/Navbar.svelte";
	import Sidebar from "$lib/Sidebar.svelte";
;
</script>

<main>
	{#if $authorizationKey}
		<Sidebar />
		<div class="responsive-wrapper">
			<section>
				<slot />
			</section>
		</div>
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
		flex-direction: row;
		min-height: 100vh;
	}

	section {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 1rem 1.2rem;

		&.center {
			align-items: center;
			justify-content: center;
		}
	}

	div.responsive-wrapper {
		display: flex;
		flex: 1;
		justify-content: center;

		section {
			max-width: 840px;
		}
	}
</style>