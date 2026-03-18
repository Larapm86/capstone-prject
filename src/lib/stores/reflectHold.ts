import { writable } from 'svelte/store';

export type ReflectHoldPhase = 'idle' | 'holding' | 'complete';

/** Hold state for Reflect page — used by layout to fade tree/horizon when holding. */
export const reflectHoldState = writable<{
	phase: ReflectHoldPhase;
	holdProgress: number;
}>({ phase: 'idle', holdProgress: 0 });
