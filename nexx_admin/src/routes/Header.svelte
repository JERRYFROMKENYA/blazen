<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	export let data;
</script>

<nav class="navbar bg-base-100 border-b">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost normal-case text-xl">
			<img src={logo} alt="NexX" />
		</a>
	</div>
	<div class="flex-none">
		{#if !data.user}
			<div class="dropdown dropdown-end">
				<a href="/login" class="btn btn-primary">Login</a>
			</div>

		{:else}
			<div class="dropdown dropdown-end mr-4">
			<a href="/profile" class="btn btn-ghost">{data.user.email}</a>
			<a href="/logout" class="btn btn-primary">Logout</a>
			</div>
			<div class="dropdown dropdown-end">
				<!-- svelte-ignore a11y-no-noninteractive-tab-index -->
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label tabindex="0" class="btn btn-ghost btn-circle avatar">
					<div class="w10 h10 rounded-full bg-primary text-primary text-lg flex items-center justify-center">
						<img src="https://avatars.dicebear.com/api/avataaars/1234.svg">
					</div>

				</label>
			</div>


		{/if}
	</div>

</nav>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
