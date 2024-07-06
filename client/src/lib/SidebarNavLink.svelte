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
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1rem;

		transition: background 0.2s;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		&.active {
			background-color: rgba(255, 255, 255, 0.2);
		}
	}
</style>