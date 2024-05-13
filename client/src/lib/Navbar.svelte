<script lang="ts">
	import { page } from "$app/stores";
	import { logOut } from "./axios";
	import Button from "./components/ui/button/button.svelte";

	const links = [
		{
			href: "/targets",
			name: "Targets",
		},
		{
			href: "/templates",
			name: "Templates",
		},
	];

	function active(href: string) {
		if ($page.url.pathname.startsWith(href)) {
			return "text-white underline";
		}
	}
</script>

<header class="sticky top-0 flex items-center gap-8 border-b bg-background px-4 py-3">
	<h1 class="text-lg font-bold">
		<a href="/">Mailform</a>
	</h1>
	<nav class="flex flex-1 items-center gap-4">
		{#each links as link}
			{#key $page.url.pathname}
				<a
					href={link.href}
					class="text-gray-400 transition-colors hover:text-white {active(link.href)}"
				>
					{link.name}
				</a>
			{/key}
		{/each}
	</nav>
	<Button variant="secondary" size="sm" on:click={logOut}>Log out</Button>
</header>
