<script lang="ts">
	import type { GlazeWithVariants } from '$lib/types';

	let { glaze }: { glaze: GlazeWithVariants } = $props();

	const primaryVariant = $derived(glaze.variants[0]);
	const hasPhoto = $derived(primaryVariant?.photo === true);
</script>

<a
	href="/glazes/{glaze.id}"
	class="block rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
>
	<div class="aspect-square bg-gray-100 dark:bg-gray-700 relative">
		{#if hasPhoto}
			<img
				src="/api/photos/{primaryVariant.id}"
				alt={glaze.name}
				class="w-full h-full object-cover"
			/>
		{:else}
			<div
				class="w-full h-full flex items-center justify-center"
				style="background-color: {primaryVariant?.colour_code ?? '#888'}"
			>
				<span class="text-white text-opacity-50 text-sm">No photo</span>
			</div>
		{/if}
		{#if hasPhoto}
			<div class="absolute top-2 right-2 flex gap-1">
				{#each glaze.variants as variant}
					<div
						class="w-6 h-6 rounded-full border-2 border-white shadow"
						style="background-color: {variant.colour_code}"
						title="{variant.temp_min}-{variant.temp_max}°C"
					></div>
				{/each}
			</div>
		{/if}
	</div>
	<div class="p-4">
		<h3 class="font-semibold text-lg mb-1">{glaze.name}</h3>
		<div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
			{primaryVariant?.temp_min ?? '?'} - {primaryVariant?.temp_max ?? '?'}°C
			{#if glaze.variants.length > 1}
				<span class="ml-1">({glaze.variants.length} variants)</span>
			{/if}
		</div>
		<div class="flex gap-2">
			{#if glaze.foodsafe === true}
				<span
					class="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
				>
					Food safe
				</span>
			{:else if glaze.foodsafe === false}
				<span
					class="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
				>
					Not food safe
				</span>
			{/if}
			{#if glaze.watertight}
				<span
					class="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
				>
					Watertight
				</span>
			{/if}
		</div>
	</div>
</a>
