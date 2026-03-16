<script lang="ts">
	import { page } from '$app/stores';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';

	let { children } = $props();

	const navItems = [
		{ href: '/cravings', label: 'Track', path: '/cravings' },
		{ href: '/cravings/stats', label: 'Stats', path: '/cravings/stats', showNewBadge: true },
		{ href: '/cravings/settings', label: 'Settings', path: '/cravings/settings' }
	];
</script>

<div class="cravings-shell">
	<img src="/logo.svg" alt="Becom" class="logo" width="174" height="79" />

	<main class="app-page screen-content">
		{@render children()}
	</main>

	<nav class="bottom-nav" aria-label="Main">
		{#each navItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={$page.url.pathname === item.path}
				aria-label={item.showNewBadge && $hasNewCravingForStats ? `${item.label} — new craving logged` : item.label}
			>
				<span class="nav-label">{item.label}</span>
				{#if item.showNewBadge && $hasNewCravingForStats}
					<span class="nav-badge" aria-hidden="true"></span>
				{/if}
			</a>
		{/each}
	</nav>
</div>

<style>
	:global(body.hold-active) .bottom-nav,
	:global(body.hold-active) .logo {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
	}
	.cravings-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		/* Space for floating nav: nav height + gap below nav + safe area */
		padding-bottom: calc(4rem + 1rem + 1rem + env(safe-area-inset-bottom, 0px));
	}
	.screen-content {
		flex: 1;
	}
	.bottom-nav {
		position: fixed;
		bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 2rem);
		max-width: var(--max-width);
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		gap: 0.25rem;
		padding: 0.5rem;
		background: rgba(45, 50, 60, 0.4);
		backdrop-filter: blur(20px) saturate(1.2);
		-webkit-backdrop-filter: blur(20px) saturate(1.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 9999px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
		z-index: 100;
	}
	.nav-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--min-touch);
		padding: 0.5rem 0.25rem;
		color: rgba(255, 255, 255, 0.55);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9375rem;
		border-radius: 0.5rem;
		transition: color 0.2s ease;
	}
	.nav-item:hover {
		color: rgba(255, 255, 255, 0.85);
	}
	.nav-item.active {
		color: #ffffff;
		font-weight: 600;
	}
	.nav-item:first-child {
		border-radius: 9999px 0 0 9999px;
	}
	.nav-item:last-child {
		border-radius: 0 9999px 9999px 0;
	}
	.nav-label {
		white-space: nowrap;
	}
	.nav-item {
		position: relative;
	}
	.nav-badge {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		width: 0.5rem;
		height: 0.5rem;
		background: #fff;
		border-radius: 50%;
	}
	.nav-item:first-child .nav-badge {
		right: 0.25rem;
	}
	.nav-item:last-child .nav-badge {
		right: 0.35rem;
	}
</style>
