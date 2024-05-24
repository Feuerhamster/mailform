<script lang="ts">
	import { onMount } from "svelte";
	import type { ITarget } from "$lib/types";
	import axios from "axios";

	let targets: ITarget[] = [];

	onMount(async () => {
		const res = await axios.get<ITarget[]>("/targets");
		targets = res.data;
	});
</script>