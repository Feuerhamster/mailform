<script lang="ts">
	import { onMount } from "svelte";
	import TargetsTable from "./TargetsTable.svelte";
	import type { ITarget } from "$lib/types";
	import axios from "axios";
	import * as Card from "$lib/components/ui/card/index";
	import Button from "$lib/components/ui/button/button.svelte";
	import { goto } from "$app/navigation";
	import { Plus } from "lucide-svelte";
	import { logOut } from "$lib/axios";

	let targets: ITarget[] = [];

	onMount(async () => {
		const res = await axios.get<ITarget[]>("/targets");
		targets = res.data;
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Targets</Card.Title>
		<Card.Description>
			These are your endpoints for sending e-mails each with its own smtp and configuration
		</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<section>
			<Button on:click={() => goto("/targets/add")} variant="secondary">
				<Plus class="mr-2" />
				Create new target
			</Button>
		</section>
		{#if targets.length}
			<section class="rounded border">
				<TargetsTable data={targets} />
			</section>
		{/if}
	</Card.Content>
</Card.Root>
