<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let {
		value = $bindable('#888888'),
		id = undefined as string | undefined
	}: {
		value?: string;
		id?: string;
	} = $props();

	onMount(async () => {
		await import('vanilla-colorful');
	});

	function handleColorChanged(e: CustomEvent<{ value: string }>) {
		value = e.detail.value;
	}
</script>

<div class="colour-picker-wrapper">
	{#if browser}
		<hex-color-picker color={value} oncolor-changed={handleColorChanged}></hex-color-picker>
	{/if}
	<div class="flex items-center gap-2 mt-2">
		<input
			type="color"
			{value}
			disabled
			class="w-8 h-8 rounded border-0 flex-shrink-0 cursor-default"
		/>
		<input
			type="text"
			{id}
			bind:value
			class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
			placeholder="#000000"
		/>
	</div>
</div>

<style>
	.colour-picker-wrapper {
		--hue-slider-height: 12px;
	}

	.colour-picker-wrapper :global(hex-color-picker) {
		width: 100%;
		max-width: 240px;
		height: 180px;
	}
</style>
