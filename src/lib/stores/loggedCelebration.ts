import { writable } from 'svelte/store';

/**
 * Full-screen "Logged ✓" layer rendered in (app) layout so it survives when
 * /craving unmounts during goto('/') — avoids losing the celebration mid-timer.
 */
export type LoggedCelebrationState = { active: boolean; exiting: boolean };

export const loggedCelebration = writable<LoggedCelebrationState>({ active: false, exiting: false });

export function dismissLoggedCelebration() {
	loggedCelebration.set({ active: false, exiting: false });
}
