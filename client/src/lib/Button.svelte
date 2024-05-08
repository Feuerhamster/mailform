<script lang="ts">
	import Loader from "./Loader.svelte";

	export let loading = false;
	export let href = "";
</script>

{#if href}
	<a {href}>
		<slot />
	</a>
{:else}
	<button on:click disabled={loading}>
		{#if loading}
			<Loader />
		{:else}
			<slot />
		{/if}
	</button>
{/if}

<style lang="scss">
	button, a {
		background-color: var(--color-primary);
		font-family: inherit;
		font-size: 1rem;
		border: none;
		border-radius: var(--default-border-radius);
		color: inherit;
		padding: var(--default-padding-element);
		cursor: pointer;
		transition: 0.2s all;
		text-decoration: none;

		&:hover {
			background-color: var(--color-primary-accent);
		}
	}
</style>