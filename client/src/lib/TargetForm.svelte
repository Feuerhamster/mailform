<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Button from "./Button.svelte";
	import { ECaptchaProvider, ETargetStatus } from "./types";
	import { nanoid } from "nanoid";

	const dispatch = createEventDispatcher<{submit: typeof data}>();

	const data = {
		name: "",
		smtp: "",
		recipients: [""],
		from: "",
		status: ETargetStatus.ENABLED,
		origin: undefined,
		api_key: undefined,
		allow_files: undefined,
		allow_templates: undefined,
		allow_custom_recipients: undefined,
		subject_prefix: undefined,
		ratelimit_timespan: undefined,
		ratelimit_requests: undefined,
		success_redirect: undefined,
		error_redirect: undefined,
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

	function submit() {
		// remove empty elements
		data.recipients = data.recipients.filter(r => r);

		dispatch("submit", data);
	}

	function generateKey() {
		data.api_key = nanoid(32) as any;
	}
</script>

<form on:submit|preventDefault={submit}>
	<label>
		Display name
		<input placeholder="name" required bind:value={data.name} />
	</label>

	<label>
		SMTP Url
		<input placeholder="smtp" required bind:value={data.smtp} />
	</label>

	<label>
		From (sender e-mail address)
		<input placeholder="from email" required bind:value={data.from} />
	</label>

	<label>
		Subject prefix
		<input placeholder="prefix" bind:value={data.subject_prefix} />
	</label>

	<hr />

	<fieldset>
		<legend>Recipients</legend>

		{#each data.recipients as _, index}
			<label>
				Recipient
				<input placeholder="recipient's email address" on:change={reCalculateRecipientCount} bind:value={data.recipients[index]} />
			</label>
		{/each}
	</fieldset>

	<hr />

	<fieldset>
		<legend>Permissions</legend>

		<label class="inline">
			Allow file attatchments
			<input type="checkbox" bind:checked={data.allow_files} />
		</label>

		<label class="inline">
			Allow template usage
			<input type="checkbox" bind:checked={data.allow_templates} />
		</label>

		<label class="inline">
			Allow custom recipients from target execution
			<input type="checkbox" bind:value={data.allow_custom_recipients} />
		</label>
	</fieldset>

	<hr />

	<fieldset>
		<legend>Access restrictions</legend>

		<label>
			Origin
			<input type="Origin URL" bind:value={data.origin} />
		</label>

		
		<label>
			API Key
			<input type="Custom api key" bind:value={data.api_key} />
		</label>

		<Button type="button" on:click={generateKey}>Generate API Key</Button>
	</fieldset>

	<hr />

	<fieldset>
		<legend>Rate Limits</legend>

		<label>
			Timespan
			<input type="number" bind:value={data.ratelimit_timespan} />
		</label>

		<label>
			Max number of request allowed in timespan
			<input type="number" bind:value={data.ratelimit_requests} />
		</label>
	</fieldset>

	<hr />

	<fieldset>
		<legend>Redirects</legend>

		<label>
			Success redirect
			<input type="URL" bind:value={data.success_redirect} />
		</label>

		
		<label>
			Error redirect
			<input type="URL" bind:value={data.error_redirect} />
		</label>
	</fieldset>

	<hr />

	<fieldset>
		<legend>Captcha</legend>

		<label>
			Provider
			<select bind:value={data.captcha_provider}>
				<option disabled selected value={null}>Select provider</option>
				<option value={ECaptchaProvider.RECAPTCHA}>Google ReCaptcha</option>
				<option value={ECaptchaProvider.HCAPTCHA}>hCaptcha</option>
			</select>
		</label>

		<label>
			Secret
			<input type="text" bind:value={data.captcha_secret} />
		</label>
	</fieldset>

	<br />

	<Button type="submit">Create</Button>
</form>

<style lang="scss">
	@import "../scss/input.scss";

	@include input;

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		hr {
			margin: 0;
			border: 0;
			border-bottom: 2px solid var(--color-block-accent);
		}

		fieldset {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			margin: 0;
			border: 0;
			padding: 0;

			legend {
				font-weight: bold;
				font-size: 1.2rem;
				margin-bottom: 0.4rem;
				padding: 0;
			}
		}
	}
</style>