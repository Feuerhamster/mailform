<script lang="ts">
	import Box from "$lib/Box.svelte";
	import Form from "$lib/Forms/Form.svelte";
	import Input from "$lib/Forms/Input.svelte";
	import Select from "$lib/Forms/Select.svelte";
	import { ECaptchaProvider } from "$lib/types";

</script>
<Box>
	<h2>Add new target</h2>

	<Form>
		<h3>
			Basic configuration
		</h3>
		<Input placeholder="Name" />
		<Input placeholder="From (sender e-mail)" />
		<Input placeholder="SMTP Url" />

		<h3>
			Security
		</h3>
		<Input placeholder="Origin" />
		<Input placeholder="API Key" />

		<Select options={{0: "Google ReCaptcha", 1: "HCaptcha"}}>
		</Select>
		<Input placeholder="Captcha Secret" />

		<h3>
			Rate limit
		</h3>
		<Input placeholder="Timespan (in seconds)" />
		<Input placeholder="Request count" />
	</Form>
</Box>

<style lang="scss">
	h1, h2, h3 {
		margin: 0;
		text-align: left;
	}
</style>