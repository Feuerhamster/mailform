<script lang="ts">
	import Button from "./Button.svelte";
	import Input from "./Input.svelte";
	import { ETargetStatus } from "./types";

	const data = {
		name: "",
		smtp: "",
		recipients: [""],
		from: "",
		status: ETargetStatus.ENABLED,
		origin: "",
		api_key: "",
		allow_files: false,
		allow_templates: false,
		allow_custom_recipients: false,
		subject_prefix: "",
		ratelimit_timespan: 0,
		ratelimit_requests: 0,
		success_redirect: "",
		error_redirect: "",
		captcha_provider: undefined,
		captcha_secret: undefined
	}

	function reCalculateRecipientCount() {
		const count = data.recipients.filter((r) => r.trim() === "").length;

		if (count < 1) {
			data.recipients.push("");
			data.recipients = data.recipients;
		} else if (count > 1) {
			const last = data.recipients.findLastIndex((r) => r.trim() === "");
			data.recipients.splice(last, 1);
			data.recipients = data.recipients;
		}
	}
</script>

<form>
	<label>
		Display name
		<input placeholder="name" />
	</label>

	<label>
		SMTP Url
		<input placeholder="smtp" />
	</label>

	<label>
		From (sender e-mail address)
		<input placeholder="from email" />
	</label>

	<label>
		Subject prefix
		<input placeholder="prefix" />
	</label>

	<fieldset>
		<legend>Recipients</legend>

		{#each data.recipients as _, index}
			<label>
				Recipient
				<input placeholder="recipient's email address" on:change={reCalculateRecipientCount} bind:value={data.recipients[index]} />
			</label>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Permissions</legend>

		<label class="inline">
			Allow file attatchments
			<input type="checkbox" />
		</label>

		<label class="inline">
			Allow template usage
			<input type="checkbox" />
		</label>

		<label class="inline">
			Allow custom recipients from target execution
			<input type="checkbox" />
		</label>
	</fieldset>

	<fieldset>
		<legend>Rate Limits</legend>

		<label>
			Timespan
			<input type="number" />
		</label>

		<label>
			Max number of request allowed in timespan
			<input type="number" />
		</label>
	</fieldset>

	<fieldset>
		<legend>Redirects</legend>

		<label>
			Success redirect
			<input type="URL" />
		</label>

		
		<label>
			Error redirect
			<input type="URL" />
		</label>
	</fieldset>

	<fieldset>
		<legend>Captcha</legend>

		<label>
			Provider
			<select>
				<option disabled selected>Select provider</option>
				<option>Google ReCaptcha</option>
				<option>hCaptcha</option>
			</select>
		</label>

		<label>
			Secret
			<input type="text" />
		</label>
	</fieldset>

	<Button>Create</Button>
</form>

<style lang="scss">
	@import "../scss/input.scss";

	@include input;

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		fieldset {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>