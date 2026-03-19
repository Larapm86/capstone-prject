<script lang="ts">
	/** Per-step artwork for flip-card fronts (matches design prototype). */
	let {
		skill,
		color,
		/** Scale art to cover the dome (may crop edges slightly). */
		domeFill = false
	}: { skill: number; color: string; domeFill?: boolean } = $props();

	const par = domeFill ? 'xMidYMid slice' : 'xMidYMid meet';
</script>

{#if skill === 1}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<path
			d="M4 80 C30 34 58 18 80 18 C102 18 130 34 156 80 C130 126 102 142 80 142 C58 142 30 126 4 80Z"
			fill={color}
		/>
		<circle cx="80" cy="80" r="28" fill="white" opacity="0.18" />
		<circle cx="80" cy="80" r="18" fill="rgba(0,0,0,.3)" />
		<circle cx="70" cy="70" r="7" fill="white" opacity="0.65" />
	</svg>
{:else if skill === 2}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<circle cx="80" cy="80" r="10" fill={color} />
		<circle cx="80" cy="80" r="30" fill="none" stroke={color} stroke-width="9" />
		<circle cx="80" cy="80" r="52" fill="none" stroke={color} stroke-width="7" opacity="0.6" />
		<circle cx="80" cy="80" r="74" fill="none" stroke={color} stroke-width="5" opacity="0.28" />
	</svg>
{:else if skill === 3}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<path
			d="M10 14 C10 8 15 4 21 4 L139 4 C145 4 150 8 150 14 L150 104 C150 110 145 114 139 114 L96 114 L80 148 L64 114 L21 114 C15 114 10 110 10 104 Z"
			fill={color}
		/>
		<rect x="28" y="30" width="104" height="10" rx="5" fill="white" opacity="0.9" />
		<rect x="28" y="52" width="104" height="10" rx="5" fill="white" opacity="0.9" />
		<rect x="28" y="74" width="104" height="10" rx="5" fill="white" opacity="0.9" />
		<rect x="28" y="96" width="60" height="10" rx="5" fill="white" opacity="0.9" />
	</svg>
{:else if skill === 4}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<g transform="translate(2,2)">
			<circle cx="4" cy="4" r="18" fill={color} opacity="1" />
			<circle cx="56" cy="4" r="12" fill={color} opacity="0.22" />
			<circle cx="108" cy="4" r="12" fill={color} opacity="0.22" />
			<circle cx="4" cy="56" r="12" fill={color} opacity="0.22" />
			<circle cx="56" cy="56" r="18" fill={color} opacity="1" />
			<circle cx="108" cy="56" r="12" fill={color} opacity="0.22" />
			<circle cx="4" cy="108" r="12" fill={color} opacity="0.22" />
			<circle cx="56" cy="108" r="12" fill={color} opacity="0.22" />
			<circle cx="108" cy="108" r="18" fill={color} opacity="1" />
		</g>
	</svg>
{:else if skill === 5}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<path
			d="M80 142 C80 142 8 96 8 48 C8 26 24 12 44 18 C56 22 80 42 80 42 C80 42 104 22 116 18 C136 12 152 26 152 48 C152 96 80 142 80 142Z"
			fill={color}
		/>
	</svg>
{:else if skill === 6}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<rect x="74" y="74" width="12" height="82" rx="6" fill={color} />
		<path d="M80 10 L136 10 L154 36 L136 62 L80 62 L80 10Z" fill={color} />
		<path d="M80 68 L24 68 L6 94 L24 120 L80 120 L80 68Z" fill={color} />
	</svg>
{:else}
	<svg class="skill-card-icon" viewBox="0 0 160 160" preserveAspectRatio={par} aria-hidden="true">
		<line x1="80" y1="148" x2="80" y2="66" stroke={color} stroke-width="12" stroke-linecap="round" />
		<path d="M80 108 C80 108 34 94 30 54 C54 54 80 84 80 108Z" fill={color} opacity="0.82" />
		<path d="M80 82 C80 82 126 62 134 20 C108 20 80 58 80 82Z" fill={color} />
		<path
			d="M54 148 Q80 140 106 148"
			stroke={color}
			stroke-width="9"
			stroke-linecap="round"
			opacity="0.4"
			fill="none"
		/>
	</svg>
{/if}

<style>
	.skill-card-icon {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
