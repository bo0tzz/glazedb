<script lang="ts">
	import { getChartData } from '$lib/glazes.remote';
	import TemperatureChart from '$lib/components/TemperatureChart.svelte';

	const chartData = getChartData();
</script>

<svelte:head>
	<title>Temperature Chart - GlazeDB</title>
</svelte:head>

<div class="flex justify-between items-center mb-8 no-print">
	<h1 class="text-3xl font-bold">Temperature Chart</h1>
	<button
		onclick={() => window.print()}
		class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
	>
		Print
	</button>
</div>

{#await chartData}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:then data}
	{#if data.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400 mb-4">No glazes to display</p>
			<a href="/glazes/new" class="text-glaze-600 dark:text-glaze-400 hover:underline">
				Add your first glaze
			</a>
		</div>
	{:else}
		<TemperatureChart {data} />
	{/if}
{:catch error}
	<div class="text-center py-12 text-red-500">Error loading chart: {error.message}</div>
{/await}
