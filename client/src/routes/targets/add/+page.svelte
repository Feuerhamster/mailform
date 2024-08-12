<script lang="ts">
	import PageTitle from "$lib/PageTitle.svelte";
	import TargetForm from "$lib/TargetForm.svelte";
	import axios from "axios";
	import { pushToast } from "../../Toasts.svelte";

	async function submit(data: CustomEvent) {
		try {
			axios.post("targets", data.detail);
		} catch(e) {
			pushToast("An error occured", "error");
		}
	}
</script>

<PageTitle>
	Create new mail target
</PageTitle>

<TargetForm on:submit={submit} />

<style lang="scss">

</style>