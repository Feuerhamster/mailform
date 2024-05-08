<script lang="ts">
	export let fullsize = false;
</script>

<form on:submit|preventDefault class:fullsize>
	<slot />
</form>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--default-spacing-page);

		&.fullsize {
			align-items: stretch;
		}
	}
</style>
