<script lang="ts">
	export let value: string = "";
</script>

<input {...$$restProps} bind:value on:keyup />

<style lang="scss">
	@import "./input.scss";

	input {
		@include input-style;
	}
</style>
