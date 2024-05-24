<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
	import type { ITarget } from "$lib/types";
	import { ClipboardCopy, EllipsisVertical, Pencil, Trash2 } from "lucide-svelte";

	export let target: ITarget;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" size="icon" builders={[builder]} class="h-8 w-8 p-0">
			<EllipsisVertical size={18} />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item>
				<ClipboardCopy size={18} class="mr-2" />
				Copy Target ID
			</DropdownMenu.Item>
			{#if target.api_key}
				<DropdownMenu.Item>
					<ClipboardCopy size={18} class="mr-2" />
					Copy API Key
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			<Pencil size={18} class="mr-2" />
			Edit
		</DropdownMenu.Item>
		<DropdownMenu.Item class="text-red-400">
			<Trash2 size={18} class="mr-2" />
			Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
