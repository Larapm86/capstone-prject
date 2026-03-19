import { writable } from 'svelte/store';

/**
 * Blocks the Reflect progress pill (Skills / Insights) after returning from
 * /craving so ghost taps don’t navigate. Overlaps with afterNavigate freeze.
 */
export const postCravingNavGuardActive = writable(false);

const GUARD_MS = 2200;
let clearTimer: ReturnType<typeof setTimeout> | null = null;

export function armPostCravingNavGuard() {
	if (clearTimer) {
		clearTimeout(clearTimer);
		clearTimer = null;
	}
	postCravingNavGuardActive.set(true);
	clearTimer = setTimeout(() => {
		postCravingNavGuardActive.set(false);
		clearTimer = null;
	}, GUARD_MS);
}
