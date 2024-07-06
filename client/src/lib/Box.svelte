<article>
	{#if $$slots.header}
		<header>
			<slot name="header" />
		</header>
	{/if}
	<slot />
</article>

<style lang="scss">
	article {
		border-radius: 8px;
		background-color: var(--color-block);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 16px;

		header {
			display: flex;
			gap: 0.5rem;
			align-items: center;
		}
	}
</style>