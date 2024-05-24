<script lang="ts">
	import { CheckCircle, XCircle } from "lucide-svelte";
	import type { ToastType } from "./Toasts.svelte";

	export let icon: any;
	export let type: ToastType = "success";

	$: {
		if (!icon) {
			switch (type) {
				case "success": {
					icon = CheckCircle;
					break;
				}
				case "error": {
					icon = XCircle;
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
	<svelte:component this={icon} size={26} />
	<slot />
</div>

<style lang="scss">
	.toast {
		border-radius: 8px;
		background-color: var(--color-block);
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 10px 14px;

		&.success {
			color: var(--color-primary);
			border: 2px solid var(--color-primary);
		}
		&.error {
			color: var(--color-error);
			border: 2px solid var(--color-error);
		}
	}
</style>
