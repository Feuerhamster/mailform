<script lang="ts">
	import Box from "$lib/Box.svelte";
	import Button from "$lib/Button.svelte";
	import Form from "$lib/Forms/Form.svelte";
	import Input from "$lib/Forms/Input.svelte";


</script>

<Box>
	<h1>Mailform</h1>
	<h2>Login</h2>
	<Form>
		<Input placeholder="Username" />
		<Input placeholder="Password" />
		<Button>Log in</Button>
	</Form>
</Box>

<style lang="scss">
	h1, h2 {
		margin: 0;
	}

	h1 {
		font-weight: 600;
	}

	h2 {
		font-weight: 500;
	}
</style>