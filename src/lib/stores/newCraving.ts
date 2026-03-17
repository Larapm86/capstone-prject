import { writable } from 'svelte/store';

/** True when user has just logged a craving and Insights hasn't been visited yet. */
export const hasNewCravingForStats = writable(false);
