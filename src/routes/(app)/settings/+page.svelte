<script lang="ts">
	import { SKILLS } from '$lib/constants/skills';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const level = $derived(data?.level ?? 1);
	const progress = $derived(data?.progress ?? { current: 0, required: 1, label: 'sessions' });
	const progressPercent = $derived(
		progress.required > 0 ? Math.min(100, (progress.current / progress.required) * 100) : 0
	);

	let carouselEl: HTMLDivElement;
	let activeIndex = $state(0);

	function onCarouselScroll() {
		if (!carouselEl) return;
		const cardWidth = carouselEl.offsetWidth;
		const scrollLeft = carouselEl.scrollLeft;
		const index = Math.round(scrollLeft / cardWidth);
		activeIndex = Math.min(Math.max(0, index), SKILLS.length - 1);
	}

	function goToSlide(index: number) {
		if (!carouselEl) return;
		const cardWidth = carouselEl.offsetWidth;
		carouselEl.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
		activeIndex = index;
	}
</script>

<svelte:head>
	<title>Becom — Skills</title>
</svelte:head>

<div class="overlay-screen">
	<a href="/" class="overlay-back" aria-label="Back to Reflect">
		<svg class="overlay-back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M19 12H5M12 19l-7-7 7-7"/>
		</svg>
	</a>
	<div class="overlay-content">
<section class="me-section" aria-labelledby="skills-heading">
	<h1 id="skills-heading" class="page-title me-title">Skills</h1>
	<p class="me-subtitle">These are the skills you're learning to rewrite your relationship with food.</p>

	<div class="carousel-outer">
		<div
			class="carousel"
			role="list"
			aria-label="Skills progression"
			bind:this={carouselEl}
			onscroll={onCarouselScroll}
		>
			{#each SKILLS as skill, i}
				{@const isCompleted = skill.level < level}
				{@const isCurrent = skill.level === level}
				{@const isLocked = skill.level > level}
				<article
					class="carousel-card map-node"
					class:node--completed={isCompleted}
					class:node--current={isCurrent}
					class:node--locked={isLocked}
					role="listitem"
					aria-current={isCurrent ? 'step' : undefined}
					aria-label="Skill {skill.level}: {skill.name}{isLocked ? ' (locked)' : ''}{isCurrent ? '. Current skill.' : ''}"
				>
					<!-- Island on top of card -->
					<div class="carousel-card__island">
						<div
							class="island"
							tabindex="{isLocked ? -1 : 0}"
						>
							<div class="island-badge-wrap" aria-hidden="true">
								<div class="island-badge">
									{#if isLocked}
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
											<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
											<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
										</svg>
									{:else if isCurrent}
										<svg class="island-badge-logo" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path d="M17.5185 11.6849H15.0684V29.0246H17.5185V11.6849Z" fill="currentColor"/>
											<path d="M24.0661 13.0136C22.2134 15.9331 19.0432 17.6332 15.4019 18.0327H15.3981C14.2069 14.5686 14.3935 10.9743 16.2481 8.05299C18.1008 5.13163 21.2729 3.43159 24.9161 3.03391C26.1073 6.49996 25.9207 10.0923 24.0661 13.0136V13.0136Z" fill="currentColor"/>
											<path opacity="0.2" d="M24.066 13.0136C22.2133 15.9331 19.0431 17.6332 15.4018 18.0327H15.3999L24.916 3.03578C26.1072 6.50183 25.9206 10.0942 24.066 13.0155V13.0136Z" fill="currentColor"/>
											<path d="M15.4132 8.08128C17.2451 11.014 17.4072 14.6063 16.1916 18.0629V18.0667C12.5502 17.6426 9.39139 15.92 7.55941 12.9854C5.72743 10.0508 5.56535 6.45663 6.78101 3C10.4205 3.42407 13.5793 5.14673 15.4113 8.08128H15.4132Z" fill="currentColor"/>
											<path opacity="0.2" d="M15.4132 8.08127C17.2452 11.0139 17.4073 14.6063 16.1916 18.0629H16.1897L6.78296 3.00188C10.4224 3.42595 13.5812 5.1486 15.4132 8.08316V8.08127Z" fill="currentColor"/>
										</svg>
									{:else}
										<span class="island-badge__num">{skill.level}</span>
									{/if}
								</div>
							</div>
							<div class="island__block">
								<svg
									class="island__tile"
									viewBox="0 0 170.004 160"
									fill="none"
									preserveAspectRatio="xMidYMid meet"
									aria-hidden="true"
								>
									<g>
										<path d="M167.983 46.6236L89.7354 1.33516C86.6521 -0.449418 82.8659 -0.444754 79.7869 1.34741L2.0082 46.6186C0.666493 47.3995 -0.00279171 48.7714 8.7518e-06 50.1421C0.0028008 51.5086 0.673645 52.8739 2.01221 53.6509L37.8067 74.4295L51.5274 82.3943L80.0337 98.9421C81.5745 99.8365 83.2915 100.284 85.0085 100.284C86.7256 100.284 88.4426 99.8365 89.9833 98.9421L132.092 74.498L167.988 53.6608C169.327 52.8833 169.998 51.5172 170 50.1502C170 50.1475 170 50.1448 170 50.1421C170 48.7716 169.327 47.4014 167.983 46.6236Z" fill="var(--island-top)"/>
										<path clip-rule="evenodd" fill-rule="evenodd" d="M0.00630481 89.0568L8.7518e-06 98.7724V70.9436C0.0028008 72.3101 0.673645 73.6754 2.01221 74.4524L37.8067 95.231L51.5274 103.196L80.0337 119.744C81.5745 120.638 83.2915 121.085 85.0085 121.085V100.284C83.2915 100.284 81.5745 99.8365 80.0337 98.9421L51.5274 82.3943L37.8067 74.4295L2.01221 53.6509C0.673645 52.8739 0.0028008 51.5086 8.7518e-06 50.1421V70.9436L0.00630481 109.841V89.0568Z" fill="var(--island-side)"/>
										<path clip-rule="evenodd" fill-rule="evenodd" d="M0.00630481 89.0568L8.7518e-06 98.7724V70.9436C0.0028008 72.3101 0.673645 73.6754 2.01221 74.4524L37.8067 95.231L51.5274 103.196L80.0337 119.744C81.5745 120.638 83.2915 121.085 85.0085 121.085V100.284C83.2915 100.284 81.5745 99.8365 80.0337 98.9421L51.5274 82.3943L37.8067 74.4295L2.01221 53.6509C0.673645 52.8739 0.0028008 51.5086 8.7518e-06 50.1421V70.9436L0.00630481 109.841V89.0568Z" fill="var(--island-shade-light)"/>
										<path d="M89.9833 98.9421C88.4426 99.8365 86.7256 100.284 85.0085 100.284L85.0119 121.085C86.7278 121.085 88.4436 120.637 89.9833 119.744L132.092 95.2995L167.988 74.4623C169.221 73.7465 169.887 72.5318 169.987 71.2768L170 50.1502C169.998 51.5172 169.327 52.8833 167.988 53.6608L132.092 74.498L89.9833 98.9421Z" fill="var(--island-side)"/>
										<path d="M89.9833 98.9421C88.4426 99.8365 86.7256 100.284 85.0085 100.284L85.0119 121.085C86.7278 121.085 88.4436 120.637 89.9833 119.744L132.092 95.2995L167.988 74.4623C169.221 73.7465 169.887 72.5318 169.987 71.2768L170 50.1502C169.998 51.5172 169.327 52.8833 167.988 53.6608L132.092 74.498L89.9833 98.9421Z" fill="var(--island-shade-medium)"/>
										<path d="M2.0185 113.367L80.04 158.658C81.5807 159.553 83.2978 160 85.0148 160L85.0085 121.085C83.2915 121.085 81.5745 120.638 80.0337 119.744L51.5274 103.196L37.8067 95.231L2.01221 74.4524C0.673645 73.6754 0.0028008 72.3101 8.7518e-06 70.9436L0.00630481 89.0568V109.841C0.00350103 111.213 0.674347 112.587 2.0185 113.367Z" fill="var(--island-side-dark)"/>
										<path d="M89.9896 158.658L167.994 113.377C169.17 112.694 169.831 111.558 169.976 110.365L169.976 109.36L169.983 97.8858C169.98 98.179 169.975 98.3324 169.97 98.2909L169.975 89.5656L169.987 71.2768C169.887 72.5318 169.221 73.7465 167.988 74.4623L132.092 95.2995L89.9833 119.744C88.4436 120.637 86.7278 121.085 85.0119 121.085L85.0148 139.198V160C86.7318 160 88.4489 159.553 89.9896 158.658Z" fill="var(--island-side-dark)"/>
										<path d="M89.9896 158.658L167.994 113.377C169.17 112.694 169.831 111.558 169.976 110.365L169.976 109.36L169.983 97.8858C169.98 98.179 169.975 98.3324 169.97 98.2909L169.975 89.5656L169.987 71.2768C169.887 72.5318 169.221 73.7465 167.988 74.4623L132.092 95.2995L89.9833 119.744C88.4436 120.637 86.7278 121.085 85.0119 121.085L85.0148 139.198V160C86.7318 160 88.4489 159.553 89.9896 158.658Z" fill="var(--island-shade-medium)"/>
									</g>
								</svg>
								<div class="island__top-content">
									{#if isLocked}
										<p class="island__locked-label">Complete previous skill to unlock</p>
									{/if}
								</div>
							</div>
						</div>
					</div>
					<!-- Card body: title, progress, bar, description, CTA -->
					<div class="carousel-card__body">
						<h2 class="carousel-card__title">{skill.name}</h2>
						<p class="carousel-card__desc">{skill.description}</p>
						{#if isLocked}
							<p class="carousel-card__locked-msg">Complete previous skill to continue</p>
						{:else}
							<div
								class="carousel-card__progress"
								role="progressbar"
								aria-valuenow={isCurrent ? progress.current : progress.required}
								aria-valuemin={0}
								aria-valuemax={progress.required}
								aria-label="{isCurrent ? progress.label + ': ' + progress.current + ' of ' + progress.required : 'Completed'}"
							>
								<div class="carousel-card__progress-track">
									<div class="carousel-card__progress-fill" style="width: {isCompleted ? 100 : progressPercent}%"></div>
								</div>
							</div>
						{/if}
					</div>
				</article>
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
</section>
	</div>
</div>

<style>
	.overlay-screen {
		position: fixed;
		inset: 0;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		z-index: 101;
		padding-top: calc(1rem + env(safe-area-inset-top, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
	}
	.overlay-content {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding-top: calc(var(--min-touch) - 0.5rem);
		animation: overlay-content-in 0.2s ease-out 0.05s both;
	}
	@keyframes overlay-content-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	.overlay-back {
		position: absolute;
		top: calc(1rem + env(safe-area-inset-top, 0px));
		left: calc(1rem + env(safe-area-inset-left, 0px));
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
		background: rgba(255, 255, 255, 0.08);
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
		width: min(380px, calc(100vw - 2 * var(--page-padding)));
		scroll-snap-align: center;
		scroll-snap-stop: always;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		background: rgba(10, 45, 82, 0.35);
		border: 1px solid rgba(13, 53, 96, 0.5);
		border-radius: 20px;
		overflow: hidden;
		margin-right: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}
	.carousel-card:last-child {
		margin-right: var(--page-padding);
	}
	.carousel-card__island {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1.25rem 1rem 0.75rem;
		min-height: 140px;
	}
	.carousel-card__body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 0 1.25rem 1.25rem;
	}
	.carousel-card__title {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 0.5rem;
		line-height: 1.3;
	}
	.carousel-card__progress {
		width: 100%;
		margin-top: auto;
		margin-bottom: 0;
		padding-top: 1rem;
	}
	/* Luminous track like pill and active island */
	.carousel-card__progress-track {
		height: 14px;
		min-height: 14px;
		background: rgba(210, 230, 255, 0.22);
		border: 1px solid rgba(220, 238, 255, 0.35);
		border-radius: 999px;
		overflow: hidden;
		box-shadow: 0 0 12px rgba(180, 210, 255, 0.2);
	}
	/* Same fill as pill + luminous glow like isometric island */
	.carousel-card__progress-fill {
		height: 100%;
		background: var(--island-side-dark);
		border-radius: 999px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 4px;
		filter: drop-shadow(0 0 10px rgba(180, 210, 255, 0.45))
			drop-shadow(0 0 20px rgba(160, 195, 240, 0.28));
	}
	.carousel-card__desc {
		font-size: 16px;
		color: var(--text-muted);
		line-height: 1.45;
		margin: 0 0 1rem;
	}
	.carousel-card__locked-msg {
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.4;
		margin: 0;
		margin-top: auto;
		padding-top: 1rem;
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
		background: rgba(255, 255, 255, 0.2);
		cursor: pointer;
		padding: 0;
		transition: background 0.2s, transform 0.2s;
	}
	.carousel-dot:hover {
		background: rgba(255, 255, 255, 0.35);
	}
	.carousel-dot.active {
		background: var(--text-muted);
		transform: scale(1.15);
	}
	@media (min-width: 768px) {
		.carousel-dots {
			display: none;
		}
	}

	/* Island: badge + SVG isometric tile (single shape, seamless joins) */
	.island {
		position: relative;
		padding-top: 1.5rem;
		transition: transform 0.25s ease, filter 0.25s ease;
	}
	.island:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.4);
		outline-offset: 4px;
		border-radius: 8px;
	}
	.island__block {
		position: relative;
		width: 120px;
		height: 113px;
		margin: 0 auto;
		--island-top: var(--island-top);
		--island-side: var(--island-side);
		--island-side-dark: var(--island-side-dark);
		--island-shade-light: var(--island-shade-light);
		--island-shade-medium: var(--island-shade-medium);
	}
	/* Current skill: Hold-to-log style blues + soft glow, less transparent */
	.map-node.node--current .island__block {
		--island-top: var(--island-current-top);
		--island-side: var(--island-current-side);
		--island-side-dark: var(--island-current-side-dark);
		filter: drop-shadow(0 0 16px rgba(180, 210, 255, 0.4))
			drop-shadow(0 0 32px rgba(160, 195, 240, 0.25));
	}
	.island__tile {
		display: block;
		width: 100%;
		height: 100%;
	}
	.island__top-content {
		position: absolute;
		left: 50%;
		top: 28%;
		transform: translate(-50%, 0);
		width: 72%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	/* Side faces: gradient starts with top’s bottom color for seamless join */

	/* Badge wrapper: centers badge + optional ring */
	.island-badge-wrap {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}
	/* Badge (number or lock) */
	.island-badge {
		position: relative;
		z-index: 1;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--island-badge-bg);
		color: var(--text);
		font-weight: 700;
		font-size: 1rem;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.35),
			0 0 0 3px rgba(255, 255, 255, 0.08);
	}
	.island-badge__num {
		line-height: 1;
	}
	.island-badge-logo {
		display: block;
	}
	/* Active island badge: Becom logo in brand green */
	.map-node.node--current .island-badge .island-badge-logo {
		color: #8ADF11;
	}
	.map-node.node--locked .island-badge {
		background: var(--island-badge-locked-bg);
		color: var(--text-muted);
	}

	.island__locked-label {
		position: relative;
		font-size: 0.7rem;
		color: var(--text);
		margin: 0;
		line-height: 1.3;
		text-align: center;
	}

	/* Completed: calmer blue (app palette) */
	.map-node.node--completed .island__block {
		--island-top: var(--island-completed-top);
		--island-side: var(--island-completed-side);
		--island-side-dark: var(--island-completed-side-dark);
	}

	/* Locked: muted blue-gray (app palette) */
	.map-node.node--locked .island__block {
		--island-top: var(--island-locked-top);
		--island-side: var(--island-locked-side);
		--island-side-dark: var(--island-locked-side-dark);
	}

</style>
