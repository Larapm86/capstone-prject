import { writable } from 'svelte/store';

/**
 * When set, overrides the server level for the craving form (testing).
 * Use 1–7 or null to use server level.
 */
export const levelOverride = writable<number | null>(null);
