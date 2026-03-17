<script lang="ts">
	import { onMount } from 'svelte';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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
	<h2 id="insights-heading">Your cravings</h2>
	{#if data.cravings.length === 0}
		<p class="empty">No cravings logged yet. Switch to Reflect to add one when you feel a craving.</p>
	{:else}
		<ul class="cravings-list">
			{#each data.cravings as c (c.id)}
				<li>
					<span class="craving-text">
						{c.text}
						{#if showNewLabel && c.id === data.cravings[0]?.id}
							<span class="new-label">New</span>
						{/if}
					</span>
					<time class="craving-date" datetime={new Date(c.createdAt).toISOString()}>
						{new Date(c.createdAt).toLocaleString()}
					</time>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	h2 {
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
		flex-direction: column;
		gap: 0.25rem;
	}
	.cravings-list li:last-child {
		border-bottom: none;
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
		margin: 0;
	}
</style>
