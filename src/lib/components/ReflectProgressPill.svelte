<script lang="ts">
	import { SKILLS } from '$lib/constants/skills';

	interface Props {
		level?: number;
		progress?: { current: number; required: number; label: string };
	}
	let { level = 1, progress }: Props = $props();

	const skillName = $derived(SKILLS[Math.min(level, SKILLS.length) - 1]?.name ?? 'Reflect');
	const prog = $derived(progress ?? { current: 0, required: 1, label: 'sessions' });
	const progressPercent = $derived(
		prog.required > 0 ? Math.min(100, (prog.current / prog.required) * 100) : 0
	);
</script>

<div class="reflect-progress-pill">
	<a href="/settings" class="reflect-progress-left" aria-label="Go to Me to see your skills progress">
		<div class="reflect-progress-head">
			<div class="reflect-progress-head-text">
				<span class="reflect-progress-skill-label">Skill</span>
				<span class="reflect-progress-skill-name">{skillName}</span>
			</div>
		</div>
		<div
			class="reflect-progress"
			role="progressbar"
			aria-valuenow={prog.current}
			aria-valuemin={0}
			aria-valuemax={prog.required}
			aria-valuetext="{Math.round(progressPercent)}% complete"
			aria-label="Current skill progress, {prog.current} of {prog.required} {prog.label}"
		>
			<div class="reflect-progress-track">
				<div class="reflect-progress-fill" style="width: {progressPercent}%"></div>
			</div>
		</div>
	</a>
	<div class="reflect-progress-divider" aria-hidden="true"></div>
	<a href="/stats" class="reflect-progress-right" aria-label="Go to Insights">
		<svg class="reflect-progress-book-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M19 3.022C19 3.014 19 3.008 19 3V1C19 0.734784 18.8946 0.48043 18.7071 0.292893C18.5196 0.105357 18.2652 0 18 0C17.7348 0 17.4804 0.105357 17.2929 0.292893C17.1054 0.48043 17 0.734784 17 1V2.1C16.6709 2.03317 16.3358 1.99966 16 2H15V1C15 0.734784 14.8946 0.48043 14.7071 0.292893C14.5196 0.105357 14.2652 0 14 0C13.7348 0 13.4804 0.105357 13.2929 0.292893C13.1054 0.48043 13 0.734784 13 1V2H11V1C11 0.734784 10.8946 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0C9.73478 0 9.48043 0.105357 9.29289 0.292893C9.10536 0.48043 9 0.734784 9 1V2H8C7.66415 1.99966 7.32913 2.03317 7 2.1V1C7 0.734784 6.89464 0.48043 6.70711 0.292893C6.51957 0.105357 6.26522 0 6 0C5.73478 0 5.48043 0.105357 5.29289 0.292893C5.10536 0.48043 5 0.734784 5 1V3V3.022C4.38078 3.48437 3.8777 4.08454 3.53057 4.77498C3.18343 5.46543 3.00178 6.2272 3 7V19C3.00159 20.3256 3.52888 21.5964 4.46622 22.5338C5.40356 23.4711 6.6744 23.9984 8 24H16C17.3256 23.9984 18.5964 23.4711 19.5338 22.5338C20.4711 21.5964 20.9984 20.3256 21 19V7C20.9982 6.2272 20.8166 5.46543 20.4694 4.77498C20.1223 4.08454 19.6192 3.48437 19 3.022V3.022ZM12 17H8C7.73478 17 7.48043 16.8946 7.29289 16.7071C7.10536 16.5196 7 16.2652 7 16C7 15.7348 7.10536 15.4804 7.29289 15.2929C7.48043 15.1054 7.73478 15 8 15H12C12.2652 15 12.5196 15.1054 12.7071 15.2929C12.8946 15.4804 13 15.7348 13 16C13 16.2652 12.8946 16.5196 12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17ZM16 13H8C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11H16C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071C16.5196 12.8946 16.2652 13 16 13ZM16 9H8C7.73478 9 7.48043 8.89464 7.29289 8.70711C7.10536 8.51957 7 8.26522 7 8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7H16C16.2652 7 16.5196 7.10536 16.7071 7.29289C16.8946 7.48043 17 7.73478 17 8C17 8.26522 16.8946 8.51957 16.7071 8.70711C16.5196 8.89464 16.2652 9 16 9Z" fill="currentColor"/>
		</svg>
	</a>
</div>

<style>
	.reflect-progress-pill {
		display: flex;
		align-items: stretch;
		min-height: 60px;
		background: var(--surface-frosted);
		backdrop-filter: var(--blur-frosted);
		-webkit-backdrop-filter: var(--blur-frosted);
		border: 1px solid var(--border-frosted);
		border-radius: var(--radius-pill);
		overflow: hidden;
		padding: 8px 16px 12px 32px;
		box-shadow: var(--shadow-frosted), var(--shadow-frosted-lip);
		width: 100%;
		box-sizing: border-box;
	}
	.reflect-progress-left {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0 12px 0 0;
		text-decoration: none;
		color: var(--color-text-on-frosted);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		justify-content: center;
	}
	.reflect-progress-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.reflect-progress-head-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}
	.reflect-progress-skill-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-on-frosted-muted);
		line-height: 1.2;
	}
	.reflect-progress-skill-name {
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--color-text-on-frosted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}
	.reflect-progress-divider {
		width: 1px;
		background: var(--border-frosted-divider);
		flex-shrink: 0;
		margin: 8px 0;
	}
	.reflect-progress-right {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		flex-shrink: 0;
		text-decoration: none;
		color: var(--color-text-on-frosted);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.reflect-progress-book-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		display: block;
	}
	.reflect-progress {
		min-width: 0;
	}
	/* Same luminous track as active skill card */
	.reflect-progress-track {
		height: 14px;
		min-height: 14px;
		background: var(--color-accent-blue-soft);
		border: 1px solid var(--color-accent-blue-border);
		border-radius: var(--radius-pill);
		overflow: hidden;
		box-shadow: var(--shadow-accent-glow);
	}
	.reflect-progress-fill {
		height: 100%;
		background: var(--island-side-dark);
		border-radius: 999px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 4px;
		filter: var(--filter-drop-accent);
	}
</style>
