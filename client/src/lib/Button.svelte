<button {...$$restProps} on:click>
	<slot />
</button>

<style lang="scss">
	button {
		font-size: inherit;
		color: inherit;
		border-radius: 8px;
		border: 2px solid transparent;
		padding: 8px 14px;
		background-color: var(--color-primary);
		cursor: pointer;

		transition: background 0.2s;

		&:hover {
			background-color: var(--color-primary-accent);
		}
	}
</style>