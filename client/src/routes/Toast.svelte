<script lang="ts">
	import { Check, X } from "lucide-svelte";
	import type { ToastType } from "./Toasts.svelte";

	export let icon: any;
	export let type: ToastType = "success";

	$: {
		if (!icon) {
			switch (type) {
				case "success": {
					icon = Check;
					break;
				}
				case "error": {
					icon = X;
					break;
				}
				default: {
					break;
				}
			}
		}
	}
</script>

<div class="toast {type}" on:click {...$$restProps}>
	<svelte:component this={icon} size={28} />
	<slot />
</div>

<style lang="scss">
	.toast {
		display: flex;
		align-items: center;
		gap: var(--default-spacing-element);
		padding: var(--default-padding-element);

		border-radius: var(--default-border-radius);
		background-color: var(--color-block);
		border: 1px solid var(--color-block-accent);
		font-weight: 600;
		box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.2);

		&.success {
			color: var(--color-primary);
			border-color: var(--color-primary);
		}

		&.error {
			color: var(--color-red);
			border-color: var(--color-red);
		}
	}
</style>
