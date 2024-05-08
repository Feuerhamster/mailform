<script lang="ts">
	import { CircleCheck, CircleMinus } from "lucide-svelte";
	export let status: boolean = false;

</script>
{#if status}
	<CircleCheck style="color: var(--color-primary)" />
{:else}
	<CircleMinus style="color: var(--color-red)" />
{/if}