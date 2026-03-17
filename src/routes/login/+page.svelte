<script lang="ts">
	import { enhance } from '$app/forms';
	import { stars } from '$lib/starsData';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let signUpMode = $state(true);
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

	<main class="app-page auth-content">
		<img src="/logo.svg" alt="Becom" class="logo" width="174" height="79" />
		<p class="tagline">Every craving tells a story. We use science to help you rewrite them.</p>

		<form method="post" action="?/signInEmail" use:enhance>
			{#if signUpMode}
				<div class="form-group">
					<label for="name">Name</label>
					<input
						id="name"
						type="text"
						name="name"
						autocomplete="name"
						placeholder="Your name"
					/>
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
					<button type="submit" formaction="?/signUpEmail">Get started</button>
					<button type="button" class="form-actions-text" onclick={() => (signUpMode = false)} aria-label="Sign in to your existing account">Back? Sign in.</button>
				{:else}
					<button type="submit">Sign in</button>
					<button type="button" class="form-actions-text" onclick={() => (signUpMode = true)} aria-label="Create a new account">New here? Create an account</button>
				{/if}
			</div>
		</form>

		{#if form?.message}
			<p class="error" role="alert">{form.message}</p>
		{/if}
	</main>
</div>

<style>
	.auth-shell {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
		/* Same deep night sky as cravings */
		background: linear-gradient(
			180deg,
			#010810 0%,
			#010d18 18%,
			#011528 35%,
			#011a2e 50%,
			#011F3B 68%,
			#0a1828 85%,
			#0d1524 100%
		);
	}
	.auth-milky {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse 120% 40% at 55% 25%,
			rgba(255, 255, 255, 0.035) 0%,
			rgba(255, 255, 255, 0.012) 40%,
			transparent 70%
		);
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
		background: linear-gradient(
			to top,
			#031a20 0%,
			#041e24 22%,
			#052228 45%,
			#051D26 70%,
			#041b22 100%
		);
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
		background: linear-gradient(
			to top,
			rgba(0, 55, 60, 0.55) 0%,
			rgba(0, 70, 72, 0.25) 30%,
			rgba(0, 50, 55, 0.08) 55%,
			transparent 85%
		);
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
		background: #041210;
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
		align-items: center;
		justify-content: flex-start;
		padding: 3rem 1.5rem 3rem;
		padding-top: min(4rem, 12vh);
		color: #fff;
	}
	.auth-content .logo {
		margin-bottom: 1rem;
	}
	.auth-content .tagline {
		margin: 0 auto 1.25rem;
		max-width: 20rem;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.45;
		opacity: 0.85;
	}
	.auth-content p {
		margin: 0 0 1.5rem 0;
		opacity: 0.9;
	}
	.auth-content form {
		width: 100%;
		max-width: 20rem;
	}
	.form-group {
		margin-bottom: 1rem;
	}
	.form-group label {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.9rem;
		opacity: 0.9;
	}
	.form-group input {
		width: 100%;
		padding: 0.6rem 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
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
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.form-actions button {
		width: 100%;
		padding: 0.65rem 1rem;
		border: none;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.95);
		color: #011528;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
	}
	.form-actions button:hover {
		background: #fff;
	}
	.form-actions button.form-actions-text {
		background: transparent !important;
		border: none !important;
		color: #fff;
		font-weight: 500;
		text-decoration: none;
		border-radius: 0.35rem;
		transition: color 0.2s ease, background 0.2s ease;
	}
	.form-actions button.form-actions-text:hover {
		background: rgba(255, 255, 255, 0.12) !important;
		color: #fff;
	}
	.form-actions button.form-actions-text:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.9);
		outline-offset: 2px;
	}
	.hint {
		font-weight: normal;
		opacity: 0.8;
	}
	.error {
		color: #ff9b9b;
		margin-top: 1rem;
		font-size: 0.9rem;
	}
</style>
