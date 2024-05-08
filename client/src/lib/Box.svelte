<section>
	<slot />
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--default-padding-element);
		background-color: var(--color-block);
		padding: var(--default-padding-element);
		border-bottom: 1px solid var(--color-block-accent);
		border-radius: var(--default-border-radius);
	}
</style>