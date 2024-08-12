<script lang="ts">
	export let value: string;
</script>

<input {...$$restProps} bind:value />

<style lang="scss">
	input {
		font-size: inherit;
		color: inherit;
		border-radius: 8px;
		border: 2px solid transparent;
		padding: 0.6rem 0.8rem;
		background-color: var(--color-block-accent);

		transition: border 0.2s;

		&::placeholder {
			opacity: 0.6;
			color: var(--color-text);
		}

		&:focus {
			border-color: var(--color-primary);
			outline: 0;
		}
	}
</style>