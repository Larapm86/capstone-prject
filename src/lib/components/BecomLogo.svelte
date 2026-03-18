<script lang="ts">
	interface Props {
		size?: number;
		animate?: boolean;
	}
	let { size = 42, animate = true }: Props = $props();
	const sproutW = Math.round(size * 0.55);
	const sproutH = Math.round(size * 0.72);
</script>

<div class="becom-logo">
	<div class="becom-logo-wrap">
		<span class="becom-sprout-wrap" class:animated={animate}>
			<svg
				width={sproutW}
				height={sproutH}
				viewBox="0 0 28 36"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<!-- Stem -->
				<path
					class="becom-stem"
					class:animated={animate}
					d="M14 34 L14 16"
					stroke="#4CAF50"
					stroke-width="2.5"
					stroke-linecap="round"
				/>
				<!-- Left leaf -->
				<path
					class="becom-leaf-left"
					class:animated={animate}
					d="M14 22 C14 22 6 20 5 13 C9 13 14 18 14 22Z"
					fill="#388E3C"
				/>
				<!-- Right leaf -->
				<path
					class="becom-leaf-right"
					class:animated={animate}
					d="M14 18 C14 18 22 15 24 8 C19 8 14 14 14 18Z"
					fill="#4CAF50"
				/>
				<!-- Leaf veins -->
				<path
					d="M14 22 C11 19 7 16 5 13"
					stroke="#2E7D32"
					stroke-width="0.7"
					stroke-linecap="round"
					opacity="0.45"
				/>
				<path
					d="M14 18 C17 15 20 12 24 8"
					stroke="#388E3C"
					stroke-width="0.7"
					stroke-linecap="round"
					opacity="0.45"
				/>
			</svg>
		</span>
	</div>
</div>

<style>
	:global(.becom-logo) {
		display: inline-block;
	}
	:global(.becom-logo .becom-logo-wrap) {
		display: inline-flex;
		align-items: center;
		line-height: 1;
	}
	:global(.becom-logo .becom-sprout-wrap) {
		display: block;
		transform-origin: bottom center;
	}
	:global(.becom-logo .becom-sprout-wrap.animated) {
		animation: becom-sprout-grow 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
	}
	:global(.becom-logo .becom-stem) {
		stroke-dasharray: 20;
		stroke-dashoffset: 0;
	}
	:global(.becom-logo .becom-stem.animated) {
		animation: becom-stem-grow 0.4s ease 0.4s both;
	}
	:global(.becom-logo .becom-leaf-left.animated) {
		animation: becom-leaf-left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
	}
	:global(.becom-logo .becom-leaf-right.animated) {
		animation: becom-leaf-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.78s both;
	}
	@keyframes becom-sprout-grow {
		0% {
			transform: scaleY(0) translateY(6px);
			opacity: 0;
		}
		60% {
			transform: scaleY(1.1) translateY(-1px);
			opacity: 1;
		}
		80% {
			transform: scaleY(0.96) translateY(1px);
		}
		100% {
			transform: scaleY(1) translateY(0);
			opacity: 1;
		}
	}
	@keyframes becom-leaf-left {
		0% {
			transform: scale(0) rotate(-40deg);
			opacity: 0;
			transform-origin: bottom right;
		}
		60% {
			transform: scale(1.12) rotate(0deg);
			opacity: 1;
			transform-origin: bottom right;
		}
		80% {
			transform: scale(0.95) rotate(0deg);
			transform-origin: bottom right;
		}
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
			transform-origin: bottom right;
		}
	}
	@keyframes becom-leaf-right {
		0% {
			transform: scale(0) rotate(40deg);
			opacity: 0;
			transform-origin: bottom left;
		}
		60% {
			transform: scale(1.12) rotate(0deg);
			opacity: 1;
			transform-origin: bottom left;
		}
		80% {
			transform: scale(0.95) rotate(0deg);
			transform-origin: bottom left;
		}
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
			transform-origin: bottom left;
		}
	}
	@keyframes becom-stem-grow {
		0% {
			stroke-dashoffset: 20;
			opacity: 0;
		}
		100% {
			stroke-dashoffset: 0;
			opacity: 1;
		}
	}
</style>
