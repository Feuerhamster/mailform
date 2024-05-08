<script lang="ts">
	import Navbar from "$lib/Navbar.svelte";
	import "@fontsource/lexend";
	import Cookies from "js-cookie";
	import Login from "./Login.svelte";
	import { isLoggedIn } from "$lib/stores";

	$isLoggedIn = Cookies.get("auth-token") ? true : false;
</script>


{#if $isLoggedIn}
	<Navbar/>

	<slot />
{:else}
	<div class="center">
		<Login />
	</div>
{/if}

<style lang="scss">
	@import "../scss/colors.scss";
	@import "../scss/defaults.scss";

	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		font-size: 21px;
		font-family: "Lexend Variable", sans-serif;
		color: var(--color-text);
		font-weight: 400;
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
			flex: 1;
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