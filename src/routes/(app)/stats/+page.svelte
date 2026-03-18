<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: import('./$types').ActionData } = $props();
	let showNewLabel = $state(false);

	onMount(() => {
		if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('becom-new-craving') === '1') {
			showNewLabel = true;
			sessionStorage.removeItem('becom-new-craving');
		}
		hasNewCravingForStats.set(false);
	});
</script>

<svelte:head>
	<title>Becom — Insights</title>
</svelte:head>

<section aria-labelledby="insights-heading">
	<h2 id="insights-heading" class="page-title">Your cravings</h2>
	{#if data.cravings.length === 0}
		<p class="empty">No cravings logged yet. Switch to Reflect to add one when you feel a craving.</p>
	{:else}
		<ul class="cravings-list">
			{#each data.cravings as c (c.id)}
				<li class="craving-item">
					<div class="craving-main">
						<span class="craving-text">
							{c.text}
							{#if showNewLabel && c.id === data.cravings[0]?.id}
								<span class="new-label">New</span>
							{/if}
						</span>
						<time class="craving-date" datetime={new Date(c.createdAt).toISOString()}>
							{new Date(c.createdAt).toLocaleString()}
						</time>
					</div>
					<form method="post" action="?/deleteCraving" use:enhance class="delete-form">
						<input type="hidden" name="id" value={c.id} />
						<button type="submit" class="delete-btn" aria-label="Delete this craving">Delete</button>
					</form>
				</li>
			{/each}
		</ul>
		{#if form?.message && form?.success !== true}
			<p class="form-error" role="alert">{form.message}</p>
		{/if}
	{/if}
</section>

<style>
	h2:not(.page-title) {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}
	.new-label {
		display: inline-block;
		margin-left: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-muted);
	}
	.cravings-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.cravings-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.cravings-list li:last-child {
		border-bottom: none;
	}
	.craving-item .craving-main {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}
	.craving-text {
		font-weight: 500;
	}
	.craving-date {
		font-size: 0.875rem;
		color: var(--text-muted);
	}
	.delete-form {
		flex-shrink: 0;
	}
	.delete-btn {
		padding: 0.35rem 0.6rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--error);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		cursor: pointer;
	}
	.delete-btn:hover {
		background: rgba(248, 113, 113, 0.1);
	}
	.form-error {
		margin-top: 0.75rem;
		color: var(--error);
		font-size: 0.875rem;
	}
	.empty {
		color: var(--text-muted);
		font-style: italic;
		margin: 0;
	}
</style>
