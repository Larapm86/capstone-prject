import { writable } from 'svelte/store';

/** True when user has just logged a craving and Stats hasn't been visited yet. */
export const hasNewCravingForStats = writable(false);
