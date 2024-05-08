<script lang="ts">
	import autosize from "$lib/autosize-action";

	export let value: string = "";
</script>

<textarea {...$$restProps} bind:value on:keyup use:autosize />

<style lang="scss">
	textarea {
		font-size: 1rem;
		font-family: inherit;
		padding: var(--default-padding-element);
		outline: 0;
		border-radius: var(--default-border-radius);
		background-color: var(--color-grey-main);
		border: 2px solid var(--color-grey-second);
		box-shadow: inset 0 2px var(--color-grey-second);
		min-width: 50%;
		transition: 0.05s ease transform;
		font-weight: 500;
		letter-spacing: 0.4px;
		color: var(--color-text);
		resize: vertical;

		&:focus {
			transition: 0.05s ease transform;
			transform: scale(1.1);
		}
	}
</style>
