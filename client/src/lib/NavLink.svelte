<script lang="ts">
	import { page } from "$app/stores";

	export let exact = false;
	export let href = "/";

	$: active = $page.url.pathname.startsWith(href) ? "active" : "";
	$: activeExact = $page.url.pathname === href ? "active" : "";
</script>

<a {...$$props} {href} class={exact ? activeExact : active}>
	<slot />
</a>

<style lang="scss">
	a {
		color: var(--color-text);
		text-decoration: none;
		opacity: 0.6;
		position: relative;

		transition: opacity 0.2s;

		&:hover {
			opacity: 1;
		}

		&.active {
			opacity: 1;
		}

		&.active::after {
			content: "";
			position: absolute;
			bottom: -4px;
			border-radius: 36px;
			left: 10%;
			height: 3px;
			background-color: var(--color-text);
			width: 80%;
		}
	}
</style>