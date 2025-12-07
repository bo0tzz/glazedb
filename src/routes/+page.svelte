<script lang="ts">
	import { getGlazes } from '$lib/glazes.remote';
	import GlazeCard from '$lib/components/GlazeCard.svelte';

	const glazes = getGlazes();
</script>

<svelte:head>
	<title>Glazes - GlazeDB</title>
</svelte:head>

<div class="flex justify-between items-center mb-8">
	<h1 class="text-3xl font-bold">Glazes</h1>
	<a
		href="/glazes/new"
		class="px-4 py-2 bg-glaze-600 text-white rounded-lg hover:bg-glaze-700 transition-colors"
	>
		Add Glaze
	</a>
</div>

{#await glazes}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:then list}
	{#if list.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400 mb-4">No glazes yet</p>
			<a href="/glazes/new" class="text-glaze-600 dark:text-glaze-400 hover:underline">
				Add your first glaze
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each list as glaze (glaze.id)}
				<GlazeCard {glaze} />
			{/each}
		</div>
	{/if}
{:catch error}
	<div class="text-center py-12 text-red-500">Error loading glazes: {error.message}</div>
{/await}
