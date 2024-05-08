<script lang="ts">
	import Box from "$lib/Box.svelte";
	import Button from "$lib/Button.svelte";
	import Status from "$lib/Status.svelte";
	import { type ITarget, ETargetStatus, EDatabaseBoolean } from "$lib/types";
	import axios from "axios";
	import { CircleCheck, CircleMinus, FileCode2, FileUp, KeyRound, RadioTower } from "lucide-svelte";
	import { onMount } from "svelte";

	let targets: ITarget[] = []

	onMount(async () => {
		const res = await axios.get<ITarget[]>("/targets");
		targets = res.data;
	})
</script>
<Box>
	<Button href="/targets/add">
		Add new target
	</Button>
	<table cellspacing="0">
		<tr>
			<th><RadioTower /></th>
			<th>Name</th>
			<th>From</th>
			<th><KeyRound /></th>
			<th><FileUp /></th>
			<th><FileCode2 /></th>
		</tr>
		
		{#each targets as target}
			<tr>
				<td>
					<Status status={target.status === ETargetStatus.ENABLED} />
				</td>
				<td>{target.name}</td>
				<td>{target.from}</td>
				<td>
					<Status status={Boolean(target.api_key)} />
				</td>
				<td>
					<Status status={target.allow_files === EDatabaseBoolean.TRUE} />
				</td>
				<td>
					<Status status={target.allow_templates === EDatabaseBoolean.TRUE} />
				</td>
			</tr>
		{/each}
	</table>
</Box>

<style lang="scss">
	@import "../../scss/table.scss";
</style>