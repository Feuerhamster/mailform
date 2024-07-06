<script lang="ts">
	import { FileClock, LogOut, Mailbox, PlusCircle, ScrollText } from "lucide-svelte";
import NavLink from "./NavLink.svelte";
	import SidebarNavLink from "./SidebarNavLink.svelte";


</script>

<aside>
	<header>
		<img src="/favicon.png" alt="envelope" height="24" />
		<h2>Mailform</h2>
	</header>

	<section>
		<p>Targets</p>

		<SidebarNavLink href="/targets" exact>
			<Mailbox />
			Overview
		</SidebarNavLink>

		<SidebarNavLink href="/targets/add" exact>
			<PlusCircle />
			Create
		</SidebarNavLink>

		<SidebarNavLink href="/logs" exact>
			<FileClock />
			Logs
		</SidebarNavLink>
	</section>

	<section>
		<p>Templates</p>

		<SidebarNavLink href="/templates" exact>
			<ScrollText />
			Overview
		</SidebarNavLink>

		<SidebarNavLink href="/templates/add" exact>
			<PlusCircle />
			Create
		</SidebarNavLink>
	</section>

	<section>
		<p>Manage</p>

		<SidebarNavLink href="/logout">
			<LogOut />
			Log out
		</SidebarNavLink>
	</section>
	
</aside>

<style lang="scss">
	aside {
		display: flex;
		flex-direction: column;
		background-color: var(--color-block);
		box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
		padding: 1rem 1.2rem;
		gap: 1rem;

		p {
			margin: 0;
			font-weight: bold;
		}

		section {
			display: flex;
			flex-direction: column;
			gap: 0.2rem;
		}

		header {
			display: flex;
			align-items: center;
			gap: 0.4rem;

			h2 {
				margin: 0;
			}
		}
	}
</style>