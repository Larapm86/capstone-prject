/**
 * Moves the element to a portal target so it's no longer clipped by ancestor overflow.
 * Use for full-bleed layers that must render outside the main content container.
 */
export function portal(node: HTMLElement, targetSelector: string): { destroy(): void } {
	function move() {
		const target = document.querySelector(targetSelector);
		if (target && node.parentNode) {
			target.appendChild(node);
		}
	}
	// Target lives in app.html; defer so it's in the DOM (e.g. after hydration)
	if (typeof requestAnimationFrame !== 'undefined') {
		requestAnimationFrame(move);
	} else {
		move();
	}
	return {
		destroy() {}
	};
}
