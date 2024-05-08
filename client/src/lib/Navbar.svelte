<script>
	import Button from "./Button.svelte";

</script>
<header>
	<h1>Mailform</h1>
</header>

<style lang="scss">
	header {
		display: flex;
		background-color: var(--color-block);
		padding: var(--default-padding-element);
		border-bottom: 1px solid var(--color-block-accent);

		h1 {
			margin: 0;
			font-weight: 500;
			font-size: 1.4rem;
			flex: 1;
		}
	}
</style>