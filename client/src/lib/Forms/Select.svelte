<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let options: { [key: string]: string };

	const dispatch = createEventDispatcher<{ select: string }>();

	export let value: string;

	$: {
		if (value) {
			dispatch("select", value);
		}
	}
</script>

<select {...$$restProps} bind:value>
	{#each Object.entries(options) as option}
		<option value={option[0]}>{option[1]}</option>
	{/each}
</select>

<style lang="scss">
	@import "./input.scss";

	select {
		@include input-style;
	}
</style>
