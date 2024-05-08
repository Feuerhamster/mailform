<script>
	import { FileCode2, Mail } from "lucide-svelte";
import Button from "./Button.svelte";

</script>
<header>
	<h1>Mailform</h1>
	<nav>
		<a href="/targets">
			<Mail size={18} />
			Targets
		</a>
		<a href="/templates">
			<FileCode2 size={18} />
			Templates
		</a>
	</nav>

	<Button>Logout</Button>
</header>

<style lang="scss">
	header {
		display: flex;
		gap: 2rem;
		background-color: var(--color-block);
		padding: var(--default-padding-element);
		border: 1px solid var(--color-block-accent);
		border-radius: var(--default-border-radius);
		align-items: center;

		nav {
			display: flex;
			align-items: center;
			gap: 1rem;

			a {
				text-decoration: none;
				color: var(--color-text);
				display: inline-flex;
				gap: 0.2rem;
				align-items: center;
			}
		}

		h1 {
			margin: 0;
			font-weight: 500;
			font-size: 1.4rem;
			flex: 1;
		}
	}
</style>