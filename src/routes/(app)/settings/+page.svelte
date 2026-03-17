<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Becom — Settings</title>
</svelte:head>

<section aria-labelledby="settings-heading">
	<h2 id="settings-heading">Settings</h2>
	<form method="post" action="?/signOut" use:enhance class="sign-out-form">
		<button type="submit">Sign out</button>
	</form>
</section>

<style>
	h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
	}
	.sign-out-form button {
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
		width: 100%;
	}
	.sign-out-form button:hover {
		color: var(--text);
	}
</style>
