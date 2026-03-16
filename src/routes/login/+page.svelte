<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Becom — Log in</title>
</svelte:head>

<main class="app-page">
	<img src="/logo.svg" alt="Becom" class="logo" width="174" height="79" />
	<p>Log in or register to log your cravings.</p>

	<form method="post" action="?/signInEmail" use:enhance>
		<div class="form-group">
			<label for="email">Email</label>
			<input
				id="email"
				type="email"
				name="email"
				required
				autocomplete="email"
				placeholder="you@example.com"
			/>
		</div>
		<div class="form-group">
			<label for="password">Password</label>
			<input
				id="password"
				type="password"
				name="password"
				required
				autocomplete="current-password"
				placeholder="Enter your password"
			/>
		</div>
		<div class="form-group">
			<label for="name">Name <span class="hint">(for registration only)</span></label>
			<input
				id="name"
				type="text"
				name="name"
				autocomplete="name"
				placeholder="Your name"
			/>
		</div>
		<div class="form-actions">
			<button type="submit">Log in</button>
			<button type="submit" formaction="?/signUpEmail">Register</button>
		</div>
	</form>

	{#if form?.message}
		<p class="error" role="alert">{form.message}</p>
	{/if}
</main>

<style>
	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.form-actions button {
		flex: 1;
	}
	.hint {
		font-weight: normal;
		opacity: 0.8;
	}
	.error {
		color: var(--error);
		margin-top: 1rem;
	}
</style>
