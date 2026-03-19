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

	const cravings = data?.cravings ?? [];
	const insights = data?.insights ?? { sessionsCount: 0, topTrigger: null, topEmotion: null, mostCommonNeed: null };
	const hasAnyData = cravings.length > 0;
</script>

<svelte:head>
	<title>Becom — Insights</title>
</svelte:head>

<div class="overlay-screen">
	<header class="app-nav-chrome overlay-screen__chrome" aria-label="Page tools">
		<a href="/" class="overlay-back" aria-label="Back to Reflect">
			<svg class="overlay-back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
		</a>
	</header>
	<div class="overlay-content">
<section class="insights-section" aria-labelledby="insights-heading">
	<h1 id="insights-heading" class="page-title">Insights</h1>

	{#if !hasAnyData}
		<p class="empty">No sessions yet. Switch to Reflect to log a craving and see your insights here.</p>
	{:else}
		<div class="insights-columns">
			<!-- Left: top 4 metrics -->
			<div class="insights-column-left">
				<div class="insights-grid">
					<div class="insight-card">
						<span class="insight-label">Sessions</span>
						<span class="insight-value">{insights.sessionsCount}</span>
					</div>
					<div class="insight-card">
						<span class="insight-label">Top trigger</span>
						{#if insights.topTrigger}
							<span class="insight-value">{insights.topTrigger}</span>
						{:else}
							<span class="insight-empty">Opens when you are learning <span class="insight-empty-skill">Awareness</span></span>
						{/if}
					</div>
					<div class="insight-card">
						<span class="insight-label">Top emotion</span>
						{#if insights.topEmotion}
							<span class="insight-value">{insights.topEmotion}</span>
						{:else}
							<span class="insight-empty">Opens when you are learning <span class="insight-empty-skill">Literacy</span></span>
						{/if}
					</div>
					<div class="insight-card">
						<span class="insight-label">Most common need</span>
						{#if insights.mostCommonNeed}
							<span class="insight-value">{insights.mostCommonNeed}</span>
						{:else}
							<span class="insight-empty">Opens when you are learning <span class="insight-empty-skill">Acceptance</span></span>
						{/if}
					</div>
				</div>
			</div>
			<!-- Right: craving list -->
			<div class="insights-column-right">
				<div class="craving-reflections">
					<h2 class="craving-reflections__title">Craving reflections</h2>
					<ul class="cravings-list">
						{#each cravings as c (c.id)}
							<li class="craving-item">
								<div class="craving-main">
									<span class="craving-text">
										{c.text}
										{#if showNewLabel && c.id === cravings[0]?.id}
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
				</div>
			</div>
		</div>
		{#if form?.message && form?.success !== true}
			<p class="form-error" role="alert">{form.message}</p>
		{/if}
	{/if}
</section>
	</div>
</div>

<style>
	/* Stats layout structure:
	 * - overlay-screen: horizontal/bottom padding + safe-area; top inset via app-nav-chrome (not scrolled)
	 * - overlay-content: scrollable below chrome
	 * - insights-section: flex column, gap 1.5rem
	 * - insights-columns: mobile = flex column gap 1.5rem; desktop (768px+) = grid 1fr 1.2fr, gap 2rem
	 * - insights-column-left: 4 cards in grid 2x2, gap 0.75rem; each card padding 1rem 1rem 1.25rem, gap 0.35rem
	 * - insights-column-right: craving list; list items padding 0.75rem 0, gap 0.75rem; craving-main gap 0.25rem
	 */
	.overlay-screen {
		position: fixed;
		inset: 0;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		z-index: 101;
		padding: 0 0 calc(1rem + env(safe-area-inset-bottom, 0px)) 0;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.overlay-content {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
		padding-top: 0;
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		animation: overlay-content-in 0.25s ease-out 0.06s both;
		-webkit-tap-highlight-color: transparent;
	}
	@keyframes overlay-content-in {
		from {
			opacity: 1;
			transform: translateY(0.35rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.overlay-screen__chrome {
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
	}
	.overlay-back {
		position: relative;
		inset: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--min-touch);
		height: var(--min-touch);
		color: var(--text);
		text-decoration: none;
		border-radius: 0.5rem;
		-webkit-tap-highlight-color: transparent;
		z-index: 1;
	}
	.overlay-back:hover {
		background: var(--surface-hover-light);
	}
	.overlay-back-icon {
		flex-shrink: 0;
		display: block;
	}
	.insights-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-left: 24px;
		margin-right: 24px;
	}
	.insights-columns {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	@media (min-width: 768px) {
		.insights-columns {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
			gap: 6rem;
			align-items: start;
		}
		.insights-column-left {
			position: sticky;
			top: 0;
		}
		.insights-column-right {
			min-height: 0;
		}
		.insights-column-right .craving-reflections {
			margin-top: 0;
		}
	}
	.empty {
		color: var(--text-muted);
		margin: 0;
	}
	.insights-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.insight-card {
		/* Same frosted surface as Reflect pill, without 3D lip */
		background: var(--surface-frosted);
		backdrop-filter: var(--blur-frosted);
		-webkit-backdrop-filter: var(--blur-frosted);
		border: 1px solid var(--border-frosted);
		border-radius: 0.75rem;
		padding: 1rem 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: var(--space-metric-gap);
		box-shadow: var(--shadow-frosted);
	}
	.insight-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-on-frosted-muted);
		line-height: 1.2;
	}
	.insight-value {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--color-text-on-frosted);
		line-height: 1.2;
	}
	.insight-empty {
		font-size: 0.9rem;
		color: var(--color-text-on-frosted);
		line-height: 1.35;
	}
	.insight-empty-skill {
		font-weight: 600;
		color: var(--color-text-on-frosted);
	}
	.craving-reflections {
		margin-top: 1.5rem;
	}
	.craving-reflections__title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 0.75rem 0;
	}
	h2:not(.page-title):not(.craving-reflections__title) {
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
	.craving-reflections .cravings-list {
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
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.delete-btn:hover {
		background: var(--surface-danger-soft);
	}
	.form-error {
		margin-top: 0.75rem;
		color: var(--error);
		font-size: 0.875rem;
	}
</style>
