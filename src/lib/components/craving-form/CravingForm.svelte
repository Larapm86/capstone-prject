<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		CRAVING_TRIGGERS,
		CRAVING_EMOTIONS,
		CRAVING_NEEDS,
		MIND_SAYING_SUGGESTIONS
	} from '$lib/constants/craving-options';
	import { SKILLS } from '$lib/constants/skills';
	import { getLoggingSubheadline, getStepsForSkill } from './steps-config';

	interface Props {
		skill: number;
		action: string;
		noRedirect?: boolean;
		submitLabel?: string;
		errorMessage?: string | null;
		submitting?: boolean;
		onResult?: (result: { type: string; data?: unknown }) => void;
	}

	let {
		skill = 1,
		action,
		noRedirect = true,
		submitLabel = 'Reflect',
		errorMessage = null,
		submitting = $bindable(false),
		onResult
	}: Props = $props();

	const steps = $derived(getStepsForSkill(skill));
	const skillName = $derived(SKILLS[Math.min(skill, SKILLS.length) - 1]?.name ?? 'Reflect');
	let stepIndexState = $state({ index: 0 });
	const currentStepIndex = $derived(stepIndexState.index);
	const currentStep = $derived(steps[currentStepIndex]);
	const stepSubheadline = $derived(getLoggingSubheadline(currentStepIndex));

	let text = $state('');
	let triggers = $state<string[]>([]);
	let emotion = $state('');
	let familiar = $state('');
	let mindSaying = $state('');
	let needs = $state<string[]>([]);
	let choice = $state('');
	let beforeDuringAfter = $state({ before: 3, during: 3, after: 3 });

	const isLastStep = $derived(currentStepIndex === steps.length - 1);
	const isFirstStep = $derived(currentStepIndex === 0);
	const canGoNext = $derived(
		currentStep?.stepKey === 'text'
			? text.trim().length > 0
			: currentStep?.stepKey === 'triggers'
				? true
				: currentStep?.stepKey === 'emotion'
					? emotion !== ''
					: currentStep?.stepKey === 'familiar'
						? familiar !== ''
						: currentStep?.stepKey === 'mindSaying'
							? true
							: currentStep?.stepKey === 'needs'
								? true
								: currentStep?.stepKey === 'choice'
									? choice !== ''
									: true
	);

	function toggleTrigger(t: string) {
		triggers = triggers.includes(t) ? triggers.filter((x) => x !== t) : [...triggers, t];
	}
	function toggleNeed(n: string) {
		needs = needs.includes(n) ? needs.filter((x) => x !== n) : [...needs, n];
	}

	function next() {
		if (stepIndexState.index < steps.length - 1) {
			stepIndexState.index += 1;
		}
	}

	function back() {
		if (stepIndexState.index > 0) {
			stepIndexState.index -= 1;
		}
	}
</script>

<form
	method="post"
	action={action}
	class="craving-form-inner"
	aria-label="Log a craving"
	onsubmit={() => (submitting = true)}
	use:enhance={() => {
		return async ({ result, update }) => {
			submitting = false;
			try {
				const data = result.type === 'success' || result.type === 'failure' ? result.data : undefined;
				const error = result.type === 'error' ? (result as { type: 'error'; error?: unknown }).error : undefined;
				onResult?.({ type: result.type, data, error });
				if (result.type !== 'success') {
					await update();
				}
			} catch (e) {
				onResult?.({ type: 'failure', data: { message: e instanceof Error ? e.message : 'Something went wrong.' } });
			}
		};
	}}
>
	<input type="hidden" name="noRedirect" value={noRedirect ? '1' : '0'} />
	<p class="skill-indicator" aria-live="polite">{skillName}</p>
	<!-- Hidden inputs for steps we've already passed -->
	{#if currentStepIndex > 0}
		<input type="hidden" name="text" value={text} />
	{/if}
	{#if currentStep?.stepKey !== 'triggers' && steps.findIndex((s) => s.stepKey === 'triggers') < currentStepIndex}
		{#each triggers as t}
			<input type="hidden" name="triggers" value={t} />
		{/each}
	{/if}
	{#if currentStep?.stepKey !== 'emotion' && steps.findIndex((s) => s.stepKey === 'emotion') < currentStepIndex}
		<input type="hidden" name="emotion" value={emotion} />
	{/if}
	{#if currentStep?.stepKey !== 'familiar' && steps.findIndex((s) => s.stepKey === 'familiar') < currentStepIndex}
		<input type="hidden" name="familiar" value={familiar} />
	{/if}
	{#if currentStep?.stepKey !== 'mindSaying' && steps.findIndex((s) => s.stepKey === 'mindSaying') < currentStepIndex}
		<input type="hidden" name="mindSaying" value={mindSaying} />
	{/if}
	{#if currentStep?.stepKey !== 'needs' && steps.findIndex((s) => s.stepKey === 'needs') < currentStepIndex}
		{#each needs as n}
			<input type="hidden" name="needs" value={n} />
		{/each}
	{/if}
	{#if currentStep?.stepKey !== 'choice' && steps.findIndex((s) => s.stepKey === 'choice') < currentStepIndex}
		<input type="hidden" name="choice" value={choice} />
	{/if}
	{#if currentStep?.stepKey !== 'beforeDuringAfter' && steps.findIndex((s) => s.stepKey === 'beforeDuringAfter') < currentStepIndex}
		<input
			type="hidden"
			name="beforeDuringAfter"
			value="{beforeDuringAfter.before},{beforeDuringAfter.during},{beforeDuringAfter.after}"
		/>
	{/if}

	<div class="craving-form-constrain">
	<div class="craving-form-scroll">
		{#if currentStep?.stepKey === 'text'}
			<label for="craving-form-text" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<input
				id="craving-form-text"
				type="text"
				name="text"
				bind:value={text}
				placeholder="e.g. chocolate, chips"
				inputmode="text"
				autocomplete="off"
				maxlength={500}
				class="step-input"
				aria-describedby={stepSubheadline ? 'craving-form-step-sub' : undefined}
			/>
		{:else if currentStep?.stepKey === 'triggers'}
			<label id="craving-step-label" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="chips" role="group" aria-labelledby="craving-step-label">
				{#each CRAVING_TRIGGERS as t}
					<button
						type="button"
						class="chip"
						class:selected={triggers.includes(t)}
						onclick={() => toggleTrigger(t)}
						aria-pressed={triggers.includes(t)}
						aria-label="{t} trigger"
					>
						{t}
					</button>
				{/each}
			</div>
			{#each triggers as t}
				<input type="hidden" name="triggers" value={t} />
			{/each}
		{:else if currentStep?.stepKey === 'emotion'}
			<label id="craving-emotion-label" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="emotion-grid" role="group" aria-labelledby="craving-emotion-label">
				{#each CRAVING_EMOTIONS as em}
					<button
						type="button"
						class="emotion-cell"
						class:selected={emotion === em}
						onclick={() => (emotion = em)}
						aria-pressed={emotion === em}
						aria-label="Emotion: {em}"
					>
						{em}
					</button>
				{/each}
			</div>
			<input type="hidden" name="emotion" value={emotion} />
		{:else if currentStep?.stepKey === 'familiar'}
			<label id="craving-familiar-label" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="cards-stack" role="group" aria-labelledby="craving-familiar-label">
				<button type="button" class="card-option" class:selected={familiar === 'yes'} onclick={() => (familiar = 'yes')} aria-pressed={familiar === 'yes'} aria-label="Does this feel familiar? Yes">
					Yes
				</button>
				<button type="button" class="card-option" class:selected={familiar === 'maybe'} onclick={() => (familiar = 'maybe')} aria-pressed={familiar === 'maybe'} aria-label="Does this feel familiar? Maybe">
					Maybe
				</button>
				<button
					type="button"
					class="card-option"
					class:selected={familiar === 'not_really'}
					onclick={() => (familiar = 'not_really')}
					aria-pressed={familiar === 'not_really'}
					aria-label="Does this feel familiar? Not really"
				>
					Not really
				</button>
			</div>
			<input type="hidden" name="familiar" value={familiar} />
		{:else if currentStep?.stepKey === 'mindSaying'}
			<label id="craving-mind-label" class="step-label">{currentStep.label} <span class="optional">(optional)</span></label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="chips" role="group" aria-labelledby="craving-mind-label">
				{#each MIND_SAYING_SUGGESTIONS as s}
					<button
						type="button"
						class="chip"
						class:selected={mindSaying === s}
						onclick={() => (mindSaying = mindSaying === s ? '' : s)}
						aria-pressed={mindSaying === s}
						aria-label="Mind saying: {s}"
					>
						{s}
					</button>
				{/each}
			</div>
			<input type="text" name="mindSaying" bind:value={mindSaying} class="step-input" placeholder="Or type something…" aria-label="What is your mind saying? (optional)" />
		{:else if currentStep?.stepKey === 'needs'}
			<label id="craving-needs-label" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="chips" role="group" aria-labelledby="craving-needs-label">
				{#each CRAVING_NEEDS as n}
					<button type="button" class="chip" class:selected={needs.includes(n)} onclick={() => toggleNeed(n)} aria-pressed={needs.includes(n)} aria-label="Need: {n}">
						{n}
					</button>
				{/each}
			</div>
			{#each needs as n}
				<input type="hidden" name="needs" value={n} />
			{/each}
		{:else if currentStep?.stepKey === 'choice'}
			<label id="craving-choice-label" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="cards-stack cards-equal" role="group" aria-labelledby="craving-choice-label">
				<button type="button" class="card-option" class:selected={choice === 'redirect'} onclick={() => (choice = 'redirect')} aria-pressed={choice === 'redirect'} aria-label="Choice: Redirect">
					Redirect
				</button>
				<button type="button" class="card-option" class:selected={choice === 'sit_with_it'} onclick={() => (choice = 'sit_with_it')} aria-pressed={choice === 'sit_with_it'} aria-label="Choice: Sit with it">
					Sit with it
				</button>
				<button type="button" class="card-option" class:selected={choice === 'honor_consciously'} onclick={() => (choice = 'honor_consciously')} aria-pressed={choice === 'honor_consciously'} aria-label="Choice: Honor consciously">
					Honor consciously
				</button>
			</div>
			<input type="hidden" name="choice" value={choice} />
		{:else if currentStep?.stepKey === 'beforeDuringAfter'}
			<label id="craving-bda-label" class="step-label">{currentStep.label}</label>
			{#if stepSubheadline}
				<p class="step-subheadline" id="craving-form-step-sub">{stepSubheadline}</p>
			{/if}
			<div class="sliders" role="group" aria-labelledby="craving-bda-label">
				<div class="slider-row">
					<label for="craving-before" class="slider-label">Before</label>
					<input
						id="craving-before"
						type="range"
						min="1"
						max="5"
						bind:value={beforeDuringAfter.before}
						class="slider"
						aria-valuemin={1}
						aria-valuemax={5}
						aria-valuenow={beforeDuringAfter.before}
						aria-label="How you felt before (1–5)"
					/>
					<span aria-hidden="true">{beforeDuringAfter.before}</span>
				</div>
				<div class="slider-row">
					<label for="craving-during" class="slider-label">During</label>
					<input
						id="craving-during"
						type="range"
						min="1"
						max="5"
						bind:value={beforeDuringAfter.during}
						class="slider"
						aria-valuemin={1}
						aria-valuemax={5}
						aria-valuenow={beforeDuringAfter.during}
						aria-label="How you felt during (1–5)"
					/>
					<span aria-hidden="true">{beforeDuringAfter.during}</span>
				</div>
				<div class="slider-row">
					<label for="craving-after" class="slider-label">After</label>
					<input
						id="craving-after"
						type="range"
						min="1"
						max="5"
						bind:value={beforeDuringAfter.after}
						class="slider"
						aria-valuemin={1}
						aria-valuemax={5}
						aria-valuenow={beforeDuringAfter.after}
						aria-label="How you felt after (1–5)"
					/>
					<span aria-hidden="true">{beforeDuringAfter.after}</span>
				</div>
			</div>
			<input
				type="hidden"
				name="beforeDuringAfter"
				value="{beforeDuringAfter.before},{beforeDuringAfter.during},{beforeDuringAfter.after}"
			/>
		{/if}
	</div>
	</div>

	{#if errorMessage}
		<p class="step-error" role="alert">{errorMessage}</p>
	{/if}

	<div class="craving-form-cta">
		{#if !isFirstStep}
			<button type="button" class="cta-secondary" onclick={back}>Back</button>
		{/if}
		{#if isLastStep}
			<button
				type="submit"
				class="cta-primary cta-3d-primary"
				disabled={submitting || (currentStep?.stepKey === 'text' && !text.trim())}
				aria-busy={submitting}
			>
				{submitting ? 'Saving…' : submitLabel}
			</button>
		{:else}
			<button
				type="button"
				class="cta-primary cta-3d-primary"
				disabled={currentStep?.stepKey === 'text' && !text.trim()}
				onclick={next}
			>
				Next
			</button>
		{/if}
	</div>
</form>

<style>
	.craving-form-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		overflow: hidden;
		background: var(--color-surface-paper);
	}
	.craving-form-constrain {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		max-width: 100%;
		padding: 0 0.5rem;
		overflow: hidden;
	}
	.skill-indicator {
		margin: 0 0 1rem 0;
		padding-left: calc(0.5rem + 8px);
		padding-right: calc(0.5rem + 8px);
		flex-shrink: 0;
		font-size: 0.8125rem;
		color: var(--color-brand-navy-muted);
		font-family: var(--font-sans);
	}
	.craving-form-scroll {
		flex: 1;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: 0.75rem 8px 1.25rem;
	}
	.step-subheadline {
		margin: -0.35rem 0 1rem 0;
		font-size: 0.9375rem;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-brand-navy-subtle);
		font-family: var(--font-sans);
	}
	.step-label {
		display: block;
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--color-brand-navy);
		margin-bottom: 0.5rem;
	}
	.optional {
		font-weight: 400;
		color: var(--color-brand-navy-subtle);
	}
	.step-input {
		font-size: 16px;
		padding: 0.875rem 1rem;
		width: 100%;
		box-sizing: border-box;
		background: var(--color-brand-navy-fill-soft);
		color: var(--color-brand-navy);
		border: 1px solid var(--color-brand-navy-border);
		border-radius: 0.75rem;
		font-family: var(--font-sans);
		/* Leave space above when scrolled into view (keyboard open) so CTA stays visible */
		scroll-margin-bottom: calc(var(--min-touch) + 1rem + env(safe-area-inset-bottom, 0px));
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.chip {
		padding: 0.5rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--color-brand-navy-border-strong);
		background: var(--color-surface-paper);
		color: var(--color-brand-navy);
		font-size: 0.9rem;
		font-family: var(--font-sans);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.chip.selected {
		background: var(--color-brand-navy);
		color: var(--color-text-on-frosted);
		border-color: var(--color-brand-navy);
	}
	.chip:focus-visible,
	.emotion-cell:focus-visible,
	.card-option:focus-visible {
		outline: 2px solid var(--color-brand-navy);
		outline-offset: 2px;
	}
	.emotion-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}
	.emotion-cell {
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-brand-navy-border);
		background: var(--color-surface-paper);
		color: var(--color-brand-navy);
		font-size: 0.85rem;
		font-family: var(--font-sans);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.emotion-cell.selected {
		background: var(--color-brand-navy);
		color: var(--color-text-on-frosted);
		border-color: var(--color-brand-navy);
	}
	.cards-stack {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.cards-stack.cards-equal {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.5rem;
	}
	@media (max-width: 360px) {
		.cards-stack.cards-equal {
			grid-template-columns: 1fr;
		}
	}
	.card-option {
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px solid var(--color-brand-navy-border);
		background: var(--color-surface-paper);
		color: var(--color-brand-navy);
		font-size: 1rem;
		font-weight: 500;
		font-family: var(--font-sans);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		min-height: var(--min-touch);
	}
	.card-option.selected {
		background: var(--color-brand-navy);
		color: var(--color-text-on-frosted);
		border-color: var(--color-brand-navy);
	}
	.sliders {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.slider-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.slider-row .slider-label {
		min-width: 4rem;
		font-size: 0.9rem;
		color: var(--color-brand-navy);
	}
	.step-input:focus-visible,
	.slider:focus-visible {
		outline: 2px solid var(--color-brand-navy);
		outline-offset: 2px;
	}
	.cta-secondary:focus-visible {
		outline: 2px solid var(--color-brand-navy);
		outline-offset: 2px;
	}
	.slider {
		flex: 1;
		min-width: 0;
		accent-color: var(--color-brand-navy);
	}
	.slider-row span:last-child {
		width: 1.5rem;
		text-align: right;
		font-weight: 600;
		color: var(--color-brand-navy);
	}
	.step-error {
		color: var(--error);
		font-size: 0.875rem;
		margin: 0 0 0.5rem;
	}
	.craving-form-cta {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		align-items: center;
		padding: 1rem 0;
		padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
		flex-shrink: 0;
		border-top: 1px solid var(--color-brand-navy-divider);
		margin-top: auto;
		background: var(--color-surface-paper);
		position: sticky;
		bottom: 0;
		/* Keep CTA visible and thumb-reachable when virtual keyboard opens */
	}
	.cta-primary {
		flex: 1;
		/* Visuals: global `button.cta-3d-primary` */
	}
	.cta-secondary {
		min-height: var(--min-touch);
		padding: 0.75rem 1rem;
		background: transparent;
		color: var(--color-brand-navy);
		border: 1px solid var(--color-brand-navy-border-strong);
		border-radius: 0.75rem;
		font-family: var(--font-sans);
		font-weight: 500;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
</style>
