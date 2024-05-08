<button on:click>
	<slot />
</button>

<style lang="scss">
	button {
		background-color: var(--color-primary);
		font-family: inherit;
		font-size: 1rem;
		border: none;
		border-radius: var(--default-border-radius);
		color: inherit;
		padding: 4px 12px;
		border: 1px solid var(--color-primary-accent);
		cursor: pointer;
	}
</style>