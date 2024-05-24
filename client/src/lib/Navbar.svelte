<script>
	import NavLink from "./NavLink.svelte";
	import { logOut } from "./axios";

</script>
<section>
	<div class="title">
		<img src="/favicon.png" alt="envelope" />
		<h2>Mailform</h2>
	</div>
	<nav>
		<NavLink href="/targets">Targets</NavLink>
		<NavLink href="/templates">Templates</NavLink>
	</nav>

	<button on:click={logOut}>Log out</button>
</section>

<style lang="scss">
	section {
		border-radius: 8px;
		background-color: var(--color-block);
		display: flex;
		align-items: center;
		gap: 1.2rem;
		padding: 14px 16px;

		font-size: 1.2rem;

		img {
			max-height: 1.4rem;
		}

		nav {
			display: flex;
			gap: 0.8rem;
		}

		div.title {
			display: flex;
			align-items: center;
			gap: 0.2rem;
		}

		h2 {
			margin: 0;
			font-size: 1.4rem;
		}

		button {
			background-color: var(--color-block-accent);
			border: none;
			cursor: pointer;
			font: inherit;
			color: inherit;
			padding: 6px 12px;
			border-radius: 8px;
		}
	}
</style>