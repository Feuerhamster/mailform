<script lang="ts" context="module">
	import { writable, get } from "svelte/store";

	export type ToastType = "success" | "error";

	export interface IToast {
		text: string;
		type: ToastType;
		icon?: any;
	}

	let latestToast = writable<IToast | null>(null);

	const queue: IToast[] = [];

	function showLatestToast() {
		const toast = queue.shift();

		if (!toast) return;

		latestToast.set(toast);

		setTimeout(() => {
			latestToast.set(null);
			setTimeout(showLatestToast, 100);
		}, calculateToastTime(toast.text, toast.type));
	}

	function calculateToastTime(text: string, type: ToastType) {
		const min = 1000;
		const scale = 50;

		let time = min + scale * text.length;

		if (type === "error") {
			time += 500;
		}

		return time;
	}

	export async function pushToast(text: string, type: ToastType, icon: any = null) {
		queue.push({ text, type, icon });

		if (get(latestToast) === null) {
			showLatestToast();
		}
	}
</script>

<script lang="ts">
	import Toast from "./Toast.svelte";

	import { fly } from "svelte/transition";
</script>

<div class="toast-wrapper">
	{#if $latestToast}
		<div transition:fly={{ duration: 100, y: 20 }}>
			<Toast
				type={$latestToast.type}
				icon={$latestToast.icon}
				on:click={() => latestToast.set(null)}
			>
				{$latestToast.text}
			</Toast>
		</div>
	{/if}
</div>

<style lang="scss">
	.toast-wrapper {
		position: absolute;
		overflow: hidden;
		bottom: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100vw;
		padding: 14px 0;
		gap: 0.6rem;
	}
</style>
