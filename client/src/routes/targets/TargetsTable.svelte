<script lang="ts">
	import { ETargetStatus, type ITarget } from "$lib/types";
	import { readable } from "svelte/store";
	import { createRender, createTable, Render, Subscribe } from "svelte-headless-table";
	import * as Table from "$lib/components/ui/table";
	import Badge from "$lib/components/ui/badge/badge.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import TargetsTableActions from "./TargetsTableActions.svelte";

	export let data: ITarget[];

	const table = createTable(readable(data));

	const columns = table.createColumns([
		table.column({
			accessor: ({ status }) => status,
			cell: ({ value }) => {
				const isEnabled = value === ETargetStatus.ENABLED;
				return createRender(Badge, { variant: isEnabled ? "default" : "destructive" }).slot(
					isEnabled ? "Active" : "Disabled",
				);
			},
			header: "Status",
		}),
		table.column({
			accessor: "name",
			header: "Name",
		}),
		table.column({
			accessor: "from",
			header: "From",
		}),
		table.column({
			header: "",
			accessor: (target) => target,
			cell: ({ value }) => {
				return createRender(TargetsTableActions, { target: value });
			},
		}),
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<Table.Root {...$tableAttrs}>
	<Table.Header>
		{#each $headerRows as headerRow}
			<Subscribe rowAttrs={headerRow.attrs()}>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
							<Table.Head {...attrs}>
								<Render of={cell.render()} />
							</Table.Head>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Header>
	<Table.Body {...$tableBodyAttrs}>
		{#each $pageRows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<Table.Row {...rowAttrs}>
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<Table.Cell {...attrs}>
								<Render of={cell.render()} />
							</Table.Cell>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Body>
</Table.Root>
