<script lang="ts">
	import { onMount, tick } from 'svelte';
	import SkillFlipCard from '$lib/components/skills/SkillFlipCard.svelte';
	import { SKILLS, SKILL_ADVANCE_REQUIREMENT } from '$lib/constants/skills';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const currentSkill = $derived(data?.skill ?? 1);
	const progress = $derived(data?.progress ?? { current: 0, required: 1, label: 'sessions' });
	const progressPercent = $derived(
		progress.required > 0 ? Math.min(100, (progress.current / progress.required) * 100) : 0
	);

	/** Current skill row (clamped to 1…MAX_SKILL) — drives carousel focus. */
	const activeSkill = $derived(SKILLS[Math.min(Math.max(currentSkill, 1), SKILLS.length) - 1]);
	let carouselEl: HTMLDivElement;
	let activeIndex = $state(0);

	/** Index of the card whose centre is closest to the viewport centre (works on wide desktop too). */
	function carouselIndexFromScroll() {
		if (!carouselEl) return 0;
		const cards = [...carouselEl.querySelectorAll<HTMLElement>('.carousel-card')];
		if (cards.length === 0) return 0;
		const mid = carouselEl.scrollLeft + carouselEl.clientWidth / 2;
		let best = 0;
		let bestDist = Infinity;
		cards.forEach((card, i) => {
			const cMid = card.offsetLeft + card.offsetWidth / 2;
			const d = Math.abs(cMid - mid);
			if (d < bestDist) {
				bestDist = d;
				best = i;
			}
		});
		return Math.min(Math.max(0, best), SKILLS.length - 1);
	}

	function onCarouselScroll() {
		if (!carouselEl) return;
		activeIndex = carouselIndexFromScroll();
	}

	function goToSlide(index: number, opts?: { instant?: boolean }) {
		if (!carouselEl) return;
		const cards = [...carouselEl.querySelectorAll<HTMLElement>('.carousel-card')];
		const card = cards[index];
		if (!card) return;
		const target =
			card.offsetLeft - (carouselEl.clientWidth - card.offsetWidth) / 2;
		carouselEl.scrollTo({
			left: Math.max(0, target),
			behavior: opts?.instant ? 'auto' : 'smooth'
		});
		activeIndex = index;
	}

	/** Open on the user’s current skill (same index as skill step). */
	onMount(async () => {
		await tick();
		const step = Math.min(Math.max(data?.skill ?? 1, 1), SKILLS.length);
		goToSlide(step - 1, { instant: true });
	});
</script>

<svelte:head>
	<title>Becom — Skills</title>
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
<section class="me-section" aria-labelledby="skills-heading">
	<h1 id="skills-heading" class="page-title me-title">Skills</h1>
	<p class="me-subtitle">These are the skills you're learning to rewrite your relationship with food.</p>

	{#snippet skillCard(item: (typeof SKILLS)[number])}
		{@const isCompleted = item.skill < activeSkill.skill}
		{@const isCurrent = item.skill === activeSkill.skill}
		{@const isLocked = item.skill > activeSkill.skill}
		{@const requirementCaption = isCurrent ? SKILL_ADVANCE_REQUIREMENT[item.skill] : null}
		{@const previousSkillName = item.skill > 1 ? SKILLS[item.skill - 2].name : null}
		<article
			class="carousel-card map-node"
			class:node--completed={isCompleted}
			class:node--current={isCurrent}
			class:node--locked={isLocked}
			role="listitem"
			aria-current={isCurrent ? 'step' : undefined}
			aria-label="Skill {item.skill}: {item.name}{isLocked
				? ' (locked). Learn skill ' + (previousSkillName ?? 'previous') + ' to continue.'
				: ''}{isCompleted ? '. Skill learnt.' : ''}{isCurrent ? '. Current skill.' : ''}{requirementCaption ? ' Goal: ' + requirementCaption : ''}"
		>
			<SkillFlipCard
				skill={item}
				{isLocked}
				{isCurrent}
				{isCompleted}
				progressCurrent={progress.current}
				progressRequired={progress.required}
				{progressPercent}
				progressLabel={progress.label}
				{requirementCaption}
			/>
		</article>
	{/snippet}

	<div class="skills-layout">
		<div class="skills-layout__carousel carousel-outer">
			<div
				class="carousel"
				role="list"
				aria-label="Skills progression"
				bind:this={carouselEl}
				onscroll={onCarouselScroll}
			>
				{#each SKILLS as item}
					{@render skillCard(item)}
				{/each}
			</div>
			<nav class="carousel-dots" aria-label="Go to skill">
				{#each SKILLS as _, i}
					<button
						type="button"
						class="carousel-dot"
						class:active={activeIndex === i}
						aria-label="Skill {i + 1}"
						aria-current={activeIndex === i ? 'true' : undefined}
						onclick={() => goToSlide(i)}
					></button>
				{/each}
			</nav>
		</div>
	</div>
</section>
	</div>
</div>

<style>
	.overlay-screen {
		position: fixed;
		inset: 0;
		width: 100%;
		max-width: 100vw;
		min-height: 100vh;
		min-height: 100dvh;
		height: 100dvh;
		box-sizing: border-box;
		/* Transparent so layout sky + star layers show through (see +layout.svelte) */
		background: transparent;
		display: flex;
		flex-direction: column;
		z-index: 120;
		padding: 0 0 calc(1rem + env(safe-area-inset-bottom, 0px)) 0;
	}
	.overlay-content {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding-top: 0;
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		animation: overlay-content-in 0.2s ease-out 0.05s both;
	}
	@keyframes overlay-content-in {
		from {
			opacity: 1;
			transform: translateY(6px);
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
	.me-section {
		margin-left: 24px;
		margin-right: 24px;
		padding-bottom: 3rem;
	}
	.me-title {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}
	.me-subtitle {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin: 0 0 2.5rem 0;
	}

	/* Skills page: flip-card carousel only (all viewports). */
	.skills-layout {
		display: flex;
		flex-direction: column;
	}
	.skills-layout__carousel {
		display: block;
		width: 100%;
		min-width: 0;
	}

	/* Horizontal carousel */
	.carousel-outer {
		margin: 0 calc(-1 * var(--page-padding));
		padding-bottom: 0.5rem;
	}
	.carousel {
		display: flex;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		gap: 0;
		padding: 0 var(--page-padding) 1rem;
	}
	.carousel::-webkit-scrollbar {
		display: none;
	}
	.carousel-card {
		flex: 0 0 auto;
		align-self: flex-start;
		/* Mobile: cap height so flip cards don’t overflow short viewports; desktop widens at 900px */
		width: min(300px, calc(100vw - 2 * var(--page-padding)));
		aspect-ratio: 5 / 7;
		max-height: min(78dvh, 520px);
		scroll-snap-align: center;
		scroll-snap-stop: always;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background: transparent;
		border: none;
		border-radius: 14px;
		overflow: visible;
		margin-right: 1rem;
		box-shadow: none;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
	.carousel-card :global(.skill-flip-card) {
		flex: 1;
		min-height: 0;
		height: 100%;
	}
	.carousel-card:last-child {
		margin-right: var(--page-padding);
	}
	@media (min-width: 900px) {
		.carousel-card {
			width: min(380px, calc(100vw - 2 * var(--page-padding)));
			max-height: none;
		}
	}
	.carousel-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem var(--page-padding) 0;
		flex-wrap: wrap;
	}
	.carousel-dot {
		width: 6px;
		height: 6px;
		min-width: 6px;
		min-height: 6px;
		border-radius: 50%;
		border: none;
		background: var(--surface-dot-idle);
		cursor: pointer;
		padding: 0;
		transition: background 0.2s, transform 0.2s;
	}
	.carousel-dot:hover {
		background: var(--surface-dot-active);
	}
	.carousel-dot.active {
		background: var(--text-muted);
		transform: scale(1.15);
	}

	@media (min-width: 900px) {
		.carousel-dots {
			display: none;
		}
	}

</style>
