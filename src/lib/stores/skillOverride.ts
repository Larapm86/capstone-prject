import { writable } from 'svelte/store';

/**
 * When set, overrides the server skill step for the craving form (testing).
 * Use 1–7 or null to use server value.
 */
export const skillOverride = writable<number | null>(null);
