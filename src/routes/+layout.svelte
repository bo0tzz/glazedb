<script lang="ts">
	import '../app.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
	<header class="no-print border-b border-gray-200 dark:border-gray-700">
		<nav class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
			<a href="/" class="text-xl font-semibold text-glaze-600 dark:text-glaze-400">GlazeDB</a>
			<div class="flex items-center gap-4">
				<a
					href="/"
					class="text-gray-600 dark:text-gray-300 hover:text-glaze-600 dark:hover:text-glaze-400"
				>
					Glazes
				</a>
				<a
					href="/chart"
					class="text-gray-600 dark:text-gray-300 hover:text-glaze-600 dark:hover:text-glaze-400"
				>
					Chart
				</a>
				<ThemeToggle />
			</div>
		</nav>
	</header>
	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
