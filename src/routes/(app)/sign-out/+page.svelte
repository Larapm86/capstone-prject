<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Becom — Sign out</title>
</svelte:head>

<div class="sign-out-page">
	<p>Signing out…</p>
	<form method="POST" action="?/default" use:enhance>
		<button type="submit">Sign out</button>
	</form>
</div>

<style>
	.sign-out-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
	}
	.sign-out-page form button {
		display: none;
	}
</style>
