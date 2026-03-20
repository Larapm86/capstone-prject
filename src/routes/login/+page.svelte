<script lang="ts">
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';
	import { stars } from '$lib/starsData';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	let signUpMode = $state(true);
	let authOpen = $state(false);

	function openSignIn() {
		signUpMode = false;
		authOpen = true;
	}

	function openSignUp() {
		signUpMode = true;
		authOpen = true;
	}

	const featureSections = [
		{
			label: 'Reflect',
			title: 'Track the moment',
			copy: 'Capture cravings in real time so you can spot patterns before they take over.'
		},
		{
			label: 'Understand',
			title: 'Name triggers and needs',
			copy: 'Use short prompts to identify what happened, how you felt, and what you needed.'
		},
		{
			label: 'Practice',
			title: 'Choose a conscious response',
			copy: 'Pause and decide your next move with behavioral-science guidance, not autopilot.'
		},
		{
			label: 'Grow',
			title: 'Build skills over time',
			copy: 'Progress through seven reflection levels and turn insight into lasting habit change.'
		}
	];

	/** Hero phone mockup — PNG intrinsic size drives frame aspect ratio */
	const PHONE_PREVIEW = { src: '/assets/becom-phone-story.png', w: 473, h: 1024 } as const;

	const copyrightYear = new Date().getFullYear();

	const valuePoints = [
		'Private and secure by default',
		'Fast sessions you can do anywhere',
		'Built to support conscious choices, not shame',
		'Always available when you need a mindful pause'
	];
</script>

<svelte:head>
	<title>Becom — Log in</title>
</svelte:head>

<div class="auth-shell">
	<div class="auth-milky" aria-hidden="true"></div>
	<div class="auth-stars" aria-hidden="true">
		{#each stars as star}
			<span
				class="auth-star auth-star--s{star.s}"
				style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
			></span>
		{/each}
	</div>

	<div class="auth-green-area" aria-hidden="true">
		<div class="auth-green-grass" aria-hidden="true"></div>
	</div>
	<div class="auth-horizon-glow" aria-hidden="true"></div>
	<div class="auth-night-silhouette" aria-hidden="true">
		<svg class="auth-silhouette-svg" viewBox="0 0 400 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="0,200 0,132 25,145 50,120 80,132 110,112 140,125 170,105 200,118 230,102 260,114 290,98 320,110 350,94 380,104 400,100 400,200" fill="#051a12" />
			<polygon points="0,200 0,152 30,162 60,148 95,155 130,138 165,146 200,128 235,138 270,124 305,134 340,120 370,128 400,126 400,200" fill="#041510" />
			<polygon points="0,200 15,168 45,174 75,160 108,168 140,152 175,160 208,144 242,154 275,140 308,148 342,136 375,144 400,142 400,200" fill="#031812" />
			<polygon points="0,200 22,176 55,182 88,168 120,174 155,160 190,166 225,152 260,160 295,148 330,156 365,144 400,152 400,200" fill="#030d0a" />
			<polygon points="0,200 28,180 62,184 95,172 128,178 162,166 198,172 232,162 268,168 302,158 338,164 400,170 400,200" fill="#020a08" />
			<polygon points="0,200 0,188 80,191 160,187 240,190 320,188 400,191 400,200" fill="#031812" fill-opacity="0.7" />
		</svg>
	</div>

	<main class="app-page auth-content" class:auth-content--auth-focus={authOpen}>
		<nav class="auth-top-nav" aria-label="Authentication navigation">
			<a href="{base}/" class="auth-top-nav__brand" aria-label="Go to home">
				<img src="/logo.svg" alt="Becom" width="106" height="48" />
			</a>
			<div class="auth-top-nav__actions">
				<button
					type="button"
					class="auth-top-nav__signin"
					class:active={!signUpMode && authOpen}
					onclick={openSignIn}
					aria-label="Sign in"
				>
					Sign in
				</button>
				<button
					type="button"
					class="auth-top-nav__cta cta-3d-primary cta-3d-primary--on-dark"
					class:active={signUpMode && authOpen}
					onclick={openSignUp}
					aria-label="Get started"
				>
					Get started
				</button>
			</div>
		</nav>

		<div class="auth-page-body">
		{#if authOpen}
			<div class="auth-focus-column">
				<section class="auth-focus-card" aria-labelledby="auth-focus-heading">
					<h1 id="auth-focus-heading" class="auth-focus-title">
						{signUpMode ? 'Welcome!' : 'Welcome back!'}
					</h1>
					<form method="post" action="?/signInEmail" use:enhance>
						{#if signUpMode}
							<div class="form-group">
								<label for="name">Name</label>
								<input id="name" type="text" name="name" autocomplete="name" placeholder="Your name" />
							</div>
						{/if}
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
								autocomplete={signUpMode ? 'new-password' : 'current-password'}
								placeholder="Enter your password"
							/>
						</div>
						<div class="form-actions">
							{#if signUpMode}
								<button
									type="submit"
									class="cta-3d-primary cta-3d-primary--on-dark"
									formaction="?/signUpEmail"
								>
									Create account
								</button>
							{:else}
								<button type="submit" class="cta-3d-primary cta-3d-primary--on-dark">
									Sign in
								</button>
							{/if}
						</div>
					</form>
					{#if form?.message}
						<p class="error" role="alert">{form.message}</p>
					{/if}
					{#if signUpMode}
						<button type="button" class="auth-focus-sub" onclick={openSignIn}>
							Already have an account? Sign in
						</button>
					{:else}
						<button type="button" class="auth-focus-sub" onclick={openSignUp}>
							New to Becom? Create an account
					</button>
				{/if}
				</section>
			</div>
		{:else}
		<section class="hero">
			<div class="hero-grid">
				<div class="hero-copy-col">
					<h1>Build freedom from cravings, one mindful pause at a time.</h1>
					<p class="hero-subtitle">
						A kinder way to understand and rebuild your relationship with food.
					</p>
					<button
						type="button"
						class="value-cta cta-3d-primary cta-3d-primary--on-dark"
						onclick={openSignUp}
						aria-label="Get started"
					>
						Get started
					</button>
				</div>
				<div class="hero-visual-col" aria-hidden="true">
					<div
						class="phone-mockup"
						style="--phone-preview-ar: {PHONE_PREVIEW.w} / {PHONE_PREVIEW.h}"
					>
						<div class="phone-screen">
							<img
								class="phone-screen-image"
								src={PHONE_PREVIEW.src}
								alt=""
								width={PHONE_PREVIEW.w}
								height={PHONE_PREVIEW.h}
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="mission-card" aria-label="Mission">
			<div class="mission-icon-wrap" aria-hidden="true">
				<img src="/become_logtype.svg" alt="" class="mission-icon-logo" />
			</div>
			<p class="mission-quote">
				We use behavioral science to help you understand patterns and choose responses with intention
			</p>
		</section>

		<section class="feature-section" aria-label="How Becom helps">
			<h2>A multi-component reflection program</h2>
			<div class="feature-list">
				{#each featureSections as item}
					<article class="feature-item">
						<p class="feature-label">{item.label}</p>
						<h3>{item.title}</h3>
						<p>{item.copy}</p>
					</article>
				{/each}
			</div>
		</section>

		<section class="value-section" aria-label="Why people choose Becom">
			<div class="value-section__inner">
				<h2>Designed for real life, grounded in science</h2>
				<ul class="value-list">
					{#each valuePoints as point}
						<li>
							<span class="value-check" aria-hidden="true">✓</span>
							<span>{point}</span>
						</li>
					{/each}
				</ul>
				<button
					type="button"
					class="value-cta cta-3d-primary cta-3d-primary--on-dark"
					onclick={openSignUp}
					aria-label="Get started"
				>
					Get started
				</button>
			</div>
		</section>
		{/if}
		</div>

		<footer class="auth-site-footer" role="contentinfo">
			<p class="auth-site-footer__tagline">
				Every craving tells a story. We use science to help you rewrite them.
			</p>
			<p class="auth-site-footer__legal">
				Copyright © {copyrightYear} Becom. All rights reserved.
			</p>
		</footer>
	</main>
</div>

<style>
	.auth-shell {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		overflow-y: auto;
		overflow-x: hidden;
		background: var(--gradient-sky-app);
	}

	/*
	 * Mobile: html/body stay overflow:hidden (app routes). Shell is the scroll root.
	 * IMPORTANT: main must NOT use flex:1 here — that caps main at 100dvh and clips
	 * long marketing + footer. Let main grow with content; min-height keeps short pages tall.
	 */
	@media (max-width: 767px) {
		.auth-shell {
			height: 100dvh;
			max-height: 100dvh;
			-webkit-overflow-scrolling: touch;
			overscroll-behavior-y: contain;
			scroll-padding-bottom: max(1rem, env(safe-area-inset-bottom, 0px));
		}
		.auth-content {
			flex: none;
			display: flex;
			flex-direction: column;
			width: 100%;
			min-height: 100dvh;
			min-height: 100vh;
			z-index: 10;
			isolation: isolate;
		}
		/* Pull hero down 64px; shift following blocks up 64px (net tighter stack) */
		.auth-content:not(.auth-content--auth-focus) .auth-page-body {
			padding-top: 64px;
		}
		.auth-site-footer {
			position: relative;
			z-index: 1;
			padding-top: 1.5rem;
			padding-bottom: max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)));
			padding-inline: 0.75rem;
			background: transparent;
		}
		.auth-site-footer__tagline,
		.auth-site-footer__legal {
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
		}

		/* Marketing sections: 250px net (314 − 64 pull), except hero→mission on mobile = half (~125px net) */
		.hero + .mission-card {
			margin-top: -64px;
		}
		.mission-card + .feature-section,
		.feature-section + .value-section {
			margin-top: -64px;
		}
		.hero {
			/* 189px bottom + (−64px) on mission = ~125px net — half of former 250px */
			margin-bottom: 189px;
			min-height: unset;
			align-items: flex-start;
			padding-top: 0.5rem;
		}
		.mission-card {
			margin-bottom: 314px;
		}
		.feature-section {
			margin-bottom: 314px;
		}
		.auth-page-body > .value-section {
			margin-bottom: 314px;
		}
		/*
		 * Stack copy then phone; beat later .hero-grid / .hero-visual-col (fit-content)
		 * so % widths on .phone-mockup don’t collapse.
		 */
		.hero .hero-grid {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			align-items: center;
			justify-items: stretch;
			/* 3× former gap between copy+CTA row and phone */
			gap: clamp(5.25rem, 15vw, 7.5rem);
			width: 100%;
			max-width: 100%;
			margin: 0;
		}
		.hero h1 {
			max-width: none;
			font-size: clamp(1.6rem, 6.8vw + 0.35rem, 2.35rem);
			line-height: 1.18;
			overflow-wrap: break-word;
			word-break: normal;
			hyphens: none;
		}
		.hero-subtitle {
			max-width: none;
			font-size: clamp(0.9375rem, 3.8vw, 1.0625rem);
			overflow-wrap: break-word;
			word-break: normal;
			hyphens: none;
		}
		.hero .hero-visual-col {
			justify-content: center;
			width: 100%;
			max-width: 100%;
			min-width: 0;
		}
		.hero .phone-mockup {
			width: min(17.5rem, 88vw);
			max-width: 100%;
			margin-left: auto;
			margin-right: auto;
		}
		.mission-quote {
			font-size: clamp(1.1rem, 4.8vw, 1.85rem);
			padding-inline: 0;
		}
		.feature-section h2 {
			font-size: clamp(1.3rem, 5.2vw, 1.95rem);
			line-height: 1.22;
			margin-bottom: 1.35rem;
			overflow-wrap: break-word;
			word-break: normal;
			hyphens: none;
		}
		.value-section__inner h2 {
			font-size: clamp(1.3rem, 5.2vw, 1.95rem);
			line-height: 1.22;
			margin-bottom: 1.35rem;
			overflow-wrap: break-word;
			word-break: normal;
			hyphens: none;
		}
		.feature-item {
			min-height: unset;
			padding: 1rem 0.95rem;
		}
		.feature-item h3 {
			font-size: 1.02rem;
			line-height: 1.3;
		}
		.feature-label {
			font-size: clamp(0.8rem, 2.8vw, 0.95rem);
		}
		.feature-item p {
			font-size: 0.9375rem;
			line-height: 1.5;
		}
		.value-section ul {
			width: 100%;
			max-width: 100%;
		}
		.value-section li {
			font-size: 0.9rem;
		}
		.feature-list {
			grid-template-columns: 1fr;
		}
	}
	.auth-milky {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: var(--gradient-milky-band);
	}
	.auth-stars {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.auth-star {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		opacity: var(--brightness, 0.9);
		animation: auth-star-blink 3s ease-in-out infinite;
	}
	.auth-star--s1 {
		width: 1px;
		height: 1px;
	}
	.auth-star--s2 {
		width: 2px;
		height: 2px;
	}
	.auth-star--s3 {
		width: 3px;
		height: 3px;
	}
	@keyframes auth-star-blink {
		0%, 100% {
			opacity: calc(var(--brightness, 0.9) * 0.3);
			transform: scale(1);
		}
		50% {
			opacity: var(--brightness, 0.9);
			transform: scale(1.15);
		}
	}
	.auth-green-area {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 18vh;
		min-height: 140px;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
		clip-path: polygon(
			0% 100%,
			0% 58%,
			5% 52%,
			10% 56%,
			15% 50%,
			20% 54%,
			25% 49%,
			30% 53%,
			35% 48%,
			40% 52%,
			45% 47%,
			50% 51%,
			55% 49%,
			60% 53%,
			65% 48%,
			70% 52%,
			75% 50%,
			80% 54%,
			85% 49%,
			90% 53%,
			95% 51%,
			100% 55%,
			100% 100%
		);
		background: var(--gradient-horizon-land);
	}
	.auth-green-grass {
		position: absolute;
		inset: 0;
		background-image: linear-gradient(
				to top,
				transparent 0%,
				transparent 35%,
				rgba(0, 30, 28, 0.15) 100%
			),
			repeating-linear-gradient(
				88deg,
				transparent 0,
				transparent 2px,
				rgba(0, 48, 46, 0.32) 2px,
				rgba(0, 48, 46, 0.32) 3px
			),
			repeating-linear-gradient(
				92deg,
				transparent 0,
				transparent 3px,
				rgba(0, 44, 42, 0.22) 3px,
				rgba(0, 44, 42, 0.22) 4px
			),
			repeating-linear-gradient(
				90deg,
				transparent 0,
				transparent 4px,
				rgba(0, 40, 38, 0.14) 4px,
				rgba(0, 40, 38, 0.14) 5px
			),
			repeating-linear-gradient(
				86deg,
				transparent 0,
				transparent 5px,
				rgba(0, 42, 40, 0.1) 5px,
				rgba(0, 42, 40, 0.1) 6px
			);
	}
	.auth-horizon-glow {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 50vh;
		z-index: 1;
		pointer-events: none;
		background: var(--gradient-horizon-glow);
	}
	.auth-night-silhouette {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 30vh;
		min-height: 130px;
		z-index: 2;
		pointer-events: none;
		background: var(--color-silhouette-base);
	}
	.auth-silhouette-svg {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: bottom center;
	}
	.auth-content {
		position: relative;
		z-index: 3;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		/* 8px grid: page gutter = 16px (2×8) */
		padding: 1rem;
		color: var(--color-text-on-frosted);
		gap: 1rem;
		box-sizing: border-box;
		min-height: 100vh;
		min-height: 100dvh;
		width: 100%;
		max-width: none;
		margin: 0;
	}
	.auth-content--auth-focus {
		min-height: 100dvh;
	}
	.auth-page-body {
		flex: 1;
		min-height: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	/* Marketing: body is only as tall as content; footer fills rest of min-height main */
	.auth-content:not(.auth-content--auth-focus) .auth-page-body {
		flex: 0 0 auto;
	}
	/* Sign-in/up: body grows so the card can center vertically */
	.auth-content.auth-content--auth-focus .auth-page-body {
		flex: 1 1 auto;
		min-height: 0;
	}
	/* Pin tagline + copyright to the bottom when the column is shorter than the viewport */
	.auth-content > .auth-site-footer {
		margin-top: auto;
		flex-shrink: 0;
	}
	.auth-site-footer {
		flex-shrink: 0;
		width: 100%;
		padding: 1rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
		box-sizing: border-box;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.auth-site-footer__tagline {
		margin: 0 auto;
		padding: 0 0.5rem;
		max-width: 100%;
		font-size: clamp(0.6875rem, 2.15vw, 0.875rem);
		line-height: 1.35;
		color: rgba(255, 255, 255, 0.85);
	}
	.auth-site-footer__legal {
		margin: 0;
		padding: 0 0.5rem;
		font-size: 0.75rem;
		line-height: 1.4;
		color: rgba(255, 255, 255, 0.55);
	}
	.auth-focus-column {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0;
		/* Vertical breathing room on 8px grid */
		padding: clamp(1rem, 4vh, 2rem) 0 clamp(1.5rem, 5vh, 2rem);
		min-height: 0;
		width: 100%;
		box-sizing: border-box;
	}
	.auth-focus-card {
		position: relative;
		width: min(28rem, 100%);
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 1rem;
		background: rgba(9, 24, 36, 0.72);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		padding: 1.5rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
		box-sizing: border-box;
	}
	.auth-focus-title {
		margin: 0 0 1.5rem 0;
		text-align: center;
		font-size: clamp(1.5rem, 4vw, 1.875rem);
		font-weight: 700;
		line-height: 1.25;
		color: #fff;
		letter-spacing: -0.02em;
	}
	/* Single text button: full line is clickable; hover only brightens text */
	.auth-focus-sub {
		/* 8px below primary CTA (or error) */
		margin: 0.5rem auto 0;
		display: block;
		width: fit-content;
		max-width: 100%;
		min-height: var(--min-touch, 44px);
		min-width: min(100%, var(--min-touch, 44px));
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		box-shadow: none;
		font-size: 0.86rem;
		font-weight: 600;
		line-height: 1.45;
		font-family: inherit;
		text-align: center;
		color: rgba(255, 255, 255, 0.78);
		cursor: pointer;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.auth-focus-sub:hover {
		color: rgba(255, 255, 255, 1);
		background: none;
	}
	.auth-focus-sub:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-ring-on-dark);
		outline-offset: 2px;
	}
	.auth-top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* 8px between clusters */
		gap: 0.5rem;
		padding: 0.5rem 0 1rem;
	}
	.auth-top-nav__brand {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
		border-radius: 0.5rem;
		-webkit-tap-highlight-color: transparent;
	}
	.auth-top-nav__brand:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-ring-on-dark);
		outline-offset: 2px;
	}
	.auth-top-nav__brand img {
		display: block;
		height: auto;
	}
	.auth-top-nav__actions {
		display: inline-flex;
		align-items: flex-end;
		gap: 0.5rem;
		/* Room for 3D CTA shadow without shifting “Sign in” */
		padding-bottom: 5px;
	}
	.auth-top-nav__signin {
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		padding: 0.625rem 1rem;
		border: 1px solid transparent;
		background: transparent;
		color: rgba(255, 255, 255, 0.95);
	}
	.auth-top-nav__signin:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.auth-top-nav__signin.active {
		background: rgba(255, 255, 255, 0.14);
	}
	/* Get started — global 3D plate; compact for nav */
	.auth-top-nav__cta.cta-3d-primary {
		margin-bottom: 0;
		min-height: unset;
		min-width: unset;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}
	.auth-top-nav__cta.cta-3d-primary.active {
		background: var(--cta-3d-surface-hover);
		box-shadow: 0 var(--cta-3d-extrude) 0 var(--cta-3d-shadow-hover);
	}
	.hero {
		text-align: left;
		padding: 1.15rem 0 0.65rem;
		min-height: calc(100dvh - 96px);
		display: flex;
		/* Top-align copy with phone; mobile (≤767px) also uses flex-start */
		align-items: flex-start;
		justify-content: center;
	}
	.hero-grid {
		display: grid;
		grid-template-columns: minmax(320px, 520px) max-content;
		gap: clamp(1.25rem, 4vw, 2.5rem);
		/* Match phone mockup top edge on desktop */
		align-items: start;
		width: fit-content;
		max-width: 100%;
		margin: 0 auto;
	}
	.hero-copy-col {
		min-width: 0;
	}
	.hero h1 {
		margin: 0;
		font-size: clamp(2.15rem, 5.2vw, 2.95rem);
		line-height: 1.15;
		max-width: 22ch;
		color: #fff;
		overflow-wrap: break-word;
		word-break: normal;
		hyphens: none;
	}
	.hero-subtitle {
		margin: 0.65rem 0 0;
		max-width: min(36ch, 100%);
		font-size: clamp(1rem, 2.2vw, 1.125rem);
		line-height: 1.5;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.88);
		overflow-wrap: break-word;
		word-break: normal;
		hyphens: none;
	}
	/* Same CTA as value section; hero column is left-aligned (not centered). */
	.hero-copy-col .value-cta {
		margin: 1.25rem 0 0;
	}
	.hero-visual-col {
		display: flex;
		justify-content: flex-start;
		width: fit-content;
		max-width: 100%;
	}
	.phone-mockup {
		/* Width scales; height follows image aspect ratio (status bar + UI in PNG) */
		width: clamp(205px, 20vw, 270px);
		padding: 6px;
		border-radius: 2.3rem;
		background: linear-gradient(160deg, #2b303a 0%, #090d12 100%);
		box-shadow:
			0 14px 30px rgba(0, 0, 0, 0.42),
			inset 0 0 0 1px rgba(255, 255, 255, 0.12);
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}
	.phone-screen {
		position: relative;
		width: 100%;
		aspect-ratio: var(--phone-preview-ar, 473 / 1024);
		overflow: hidden;
		border-radius: 1.95rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: #001a2c;
	}
	.phone-screen-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
	}
	.mission-card,
	.feature-section,
	.value-section {
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(9, 24, 36, 0.46);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		border-radius: 0.95rem;
		padding: 1.15rem;
	}
	.feature-section,
	.value-section {
		border: 0;
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		padding: 0;
	}
	.mission-card {
		background: transparent;
		border: 0;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		padding-top: 1.5rem;
		padding-bottom: 1.5rem;
		text-align: center;
	}
	.mission-icon-wrap {
		width: 65px;
		height: 87px;
		margin: 0 auto 0.75rem;
	}
	.mission-icon-logo {
		width: 100%;
		height: 100%;
		display: block;
	}
	.mission-quote {
		max-width: min(48ch, 100%);
		margin: 0.4rem auto 0;
		text-align: center;
		font-family: 'Noto Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
		font-size: clamp(1.45rem, 3.8vw, 2.35rem);
		font-weight: 700;
		line-height: 1.25;
		color: #fff;
		overflow-wrap: break-word;
		word-break: normal;
		hyphens: none;
	}
	.mission-emphasis {
		color: #fff;
	}
	.feature-section h2,
	.value-section h2 {
		margin: 0 0 0.8rem;
		font-size: 1.22rem;
		color: #fff;
		line-height: 1.3;
	}
	.feature-section h2 {
		text-align: center;
		font-size: clamp(1.7rem, 3.2vw, 2.4rem);
		line-height: 1.2;
		margin-bottom: 2rem;
		overflow-wrap: break-word;
		word-break: normal;
		hyphens: none;
	}
	.feature-section {
		width: 100%;
		max-width: 880px;
		/* Use inline margins only — `margin: 0 auto` was resetting mobile `margin-bottom: 314px` */
		margin-left: auto;
		margin-right: auto;
		margin-top: 0;
		box-sizing: border-box;
	}
	.value-section {
		width: 100%;
		margin: 0;
		display: flex;
		justify-content: center;
		text-align: center;
	}
	.value-section__inner {
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
		text-align: left;
		box-sizing: border-box;
	}
	.value-section__inner h2 {
		text-align: center;
		max-width: 100%;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 2rem;
		font-size: clamp(1.7rem, 3.2vw, 2.4rem);
		line-height: 1.2;
		/* Wrap on narrow viewports (nowrap caused overflow on mobile) */
		white-space: normal;
		overflow-wrap: break-word;
		word-break: normal;
		hyphens: none;
	}
	.feature-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.1rem;
	}
	.feature-item {
		min-height: 220px;
		padding: 1.25rem 1.1rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
	.feature-item h3 {
		margin: 0 0 0.5rem;
		font-size: 1.12rem;
		line-height: 1.35;
		font-weight: 600;
	}
	/* Card title (Reflect, Understand, …) — larger; h3 above is the subtitle line */
	.feature-label {
		margin: 0 0 0.45rem;
		font-size: clamp(0.9rem, 1.65vw, 1.0625rem);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
		opacity: 0.88;
	}
	.feature-item p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
		opacity: 0.9;
	}
	.value-section ul {
		margin: 0;
		padding-left: 0;
		list-style: none;
		display: grid;
		gap: 0.55rem;
		max-width: 32rem;
		margin-left: auto;
		margin-right: auto;
		width: fit-content;
	}
	.value-section li {
		display: grid;
		grid-template-columns: 1.15rem 1fr;
		align-items: start;
		column-gap: 0.45rem;
		font-size: 0.95rem;
		line-height: 1.45;
	}
	.value-check {
		transform: translateY(1px);
		color: #fff;
		font-weight: 800;
		font-size: 1rem;
		line-height: 1;
	}
	.value-cta {
		display: block;
		margin: 1.5rem auto 0;
		min-width: 14rem;
		padding: 0.78rem 1.25rem;
		font-size: 0.98rem;
	}
	/* Desktop / tablet section rhythm — 250px gaps (314 − 64 aligns with 64px body padding) */
	@media (min-width: 768px) {
		.auth-content:not(.auth-content--auth-focus) .auth-page-body {
			padding-top: 64px;
		}
		.mission-card + .feature-section,
		.feature-section + .value-section {
			margin-top: calc(314px - 64px);
		}
		.hero + .mission-card {
			margin-top: calc(314px - 64px);
		}
		.auth-page-body > .value-section {
			margin-bottom: 250px;
		}
	}
	.auth-content form {
		width: 100%;
	}
	.form-group {
		margin-bottom: 1rem;
	}
	/* Field immediately above primary CTA: no extra bottom margin — gap is .form-actions margin-top (40px) */
	.form-group:has(+ .form-actions) {
		margin-bottom: 0;
	}
	.form-group label {
		display: block;
		/* Label → control: 8px */
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.9;
		line-height: 1.25;
	}
	.form-group input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.12);
		color: var(--color-text-on-frosted);
		font-size: 1rem;
	}
	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	.form-group input:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.12);
	}
	.form-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		/* 40px below password field (last .form-group has no bottom margin) */
		margin-top: 40px;
	}
	.form-actions .cta-3d-primary {
		padding: 1rem;
		border-radius: 0.5rem;
	}
	.hint {
		font-weight: normal;
		opacity: 0.8;
	}
	.error {
		color: var(--error);
		margin-top: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.4;
	}
	@media (min-width: 740px) {
		.auth-content {
			max-width: none;
			margin: 0;
			padding: 16px;
		}
		.hero h1 {
			max-width: 20ch;
			font-size: clamp(2.25rem, 4.2vw, 3.1rem);
		}
		.mission-quote {
			max-width: min(50ch, calc(100vw - 3rem));
			font-size: clamp(1.5rem, 3.2vw, 2.45rem);
			font-weight: 700;
			line-height: 1.22;
		}
	}

	/* Side-by-side hero only from tablet/desktop — avoids 740–767px squeezing the phone off-screen */
	@media (min-width: 768px) {
		.hero-grid {
			grid-template-columns: minmax(420px, 640px) max-content;
			gap: clamp(1.5rem, 4.5vw, 3.25rem);
		}
		.hero {
			min-height: calc(100dvh - 92px);
			padding-top: 0.5rem;
		}
		.hero-visual-col {
			justify-content: flex-start;
		}
		.phone-mockup {
			width: clamp(220px, 19vw, 290px);
		}
	}
</style>
