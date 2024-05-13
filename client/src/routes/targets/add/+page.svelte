<script lang="ts">
	import { onMount } from "svelte";
	import type { ITarget } from "$lib/types";
	import axios from "axios";
	import * as Card from "$lib/components/ui/card/index";
	import * as Select from "$lib/components/ui/select/index";
	import Button from "$lib/components/ui/button/button.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Add a new target</Card.Title>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<form class="grid gap-4">
			<h2 class="text-xl font-bold">General</h2>
			<Label class="grid gap-2">
				Display name for the target
				<Input placeholder="Target name" />
			</Label>
			<Label class="grid gap-2">
				SMTP Url
				<Input placeholder="SMTP Url" />
			</Label>
			<Label class="grid gap-2">
				Sender of the E-Mail
				<Input placeholder="From" />
			</Label>

			<Separator />

			<h2 class="text-xl font-bold">Recipients</h2>
			<Label class="flex items-center gap-2">
				<Checkbox />
				<span>Allow custom recipients sent on target execution</span>
			</Label>

			<Input placeholder="Recipient E-Mail" />

			<Separator />

			<h2 class="text-xl font-bold">Access restrictions (optional)</h2>
			<Label class="grid gap-2">
				Allow only specific origin
				<Input placeholder="Origin" />
			</Label>
			<Label class="grid gap-2">
				API Key
				<Input placeholder="API Key" />
			</Label>

			<Separator />

			<h2 class="text-xl font-bold">Redirects (optional)</h2>
			<p>If the target gets called by an http form, the endpoint will respond with redirects</p>
			<Label class="grid gap-2">
				Success redirect
				<Input placeholder="Success url" />
			</Label>
			<Label class="grid gap-2">
				Error redirect
				<Input placeholder="Error url" />
			</Label>

			<Separator />

			<h2 class="text-xl font-bold">Rate limits (optional)</h2>
			<Label class="grid gap-2">
				Timespan in Seconds
				<Input placeholder="Timespan" type="number" />
			</Label>
			<Label class="grid gap-2">
				Request count
				<Input placeholder="Request count" type="number" />
			</Label>

			<Separator />

			<h2 class="text-xl font-bold">Captcha (optional)</h2>
			<Label class="grid gap-2">
				Provider
				<Select.Root>
					<Select.Trigger>
						<Select.Value placeholder="Select a provider" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="recaptcha">Google ReCaptcha</Select.Item>
						<Select.Item value="dark">hCaptcha</Select.Item>
						<Select.Item value={null}>None</Select.Item>
					</Select.Content>
				</Select.Root>
			</Label>
			<Label class="grid gap-2">
				Secret
				<Input placeholder="Secret" />
			</Label>

			<Separator />

			<h2 class="text-xl font-bold">Rules</h2>

			<Label class="flex items-center gap-2">
				<Checkbox />
				<span>
					<b>Attatchments:</b> Allow file uploads for email attatchments
				</span>
			</Label>
			<Label class="flex items-center gap-2">
				<Checkbox />
				<span>
					<b>Templates:</b> Allow usage of templates on this target
				</span>
			</Label>

			<Separator />

			<Button type="submit">Submit</Button>
		</form>
	</Card.Content>
</Card.Root>
