<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Becom — Cravings</title>
</svelte:head>

<main class="app-page">
	<img src="/logo.svg" alt="Becom" class="logo" width="174" height="79" />
	<p>What are you craving? Type it below — no judgment.</p>

	<form method="post" action="?/logCraving" use:enhance>
		<div class="form-group">
			<label for="craving-text">What are you craving?</label>
			<input
				id="craving-text"
				type="text"
				name="text"
				placeholder="e.g. chocolate, chips, a sandwich"
				inputmode="text"
				autocomplete="off"
				maxlength={500}
			/>
		</div>
		<button type="submit">Log craving</button>
	</form>

	{#if form?.message}
		<p class="error" role="alert">{form.message}</p>
	{/if}

	<section class="cravings-list" aria-label="Your cravings">
		<h2>Your cravings</h2>
		{#if data.cravings.length === 0}
			<p class="empty">No cravings logged yet. Add one above when you feel a craving.</p>
		{:else}
			<ul>
				{#each data.cravings as c (c.id)}
					<li>
						<span class="craving-text">{c.text}</span>
						<time class="craving-date" datetime={new Date(c.createdAt).toISOString()}>
							{new Date(c.createdAt).toLocaleString()}
						</time>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<form method="post" action="?/signOut" use:enhance class="sign-out">
		<button type="submit">Sign out</button>
	</form>
</main>

<style>
	.cravings-list {
		margin-top: 2rem;
	}
	.cravings-list h2 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.cravings-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.cravings-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.craving-text {
		font-weight: 500;
	}
	.craving-date {
		font-size: 0.875rem;
		color: var(--text-muted);
	}
	.empty {
		color: var(--text-muted);
		font-style: italic;
	}
	.error {
		color: var(--error);
		margin-top: 1rem;
	}
	.sign-out {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.sign-out button {
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
	}
	.sign-out button:hover {
		color: var(--text);
	}
</style>
