<script lang="ts">
	import { goto } from '$app/navigation';
	import { createGlaze } from '$lib/glazes.remote';
	import PhotoUpload from '$lib/components/PhotoUpload.svelte';
	import ColourPicker from '$lib/components/ColourPicker.svelte';

	let name = $state('');
	let foodsafe = $state<boolean | null>(null);
	let watertight = $state(false);
	let notes = $state('');
	let colour_code = $state('#888888');
	let temp_min = $state(1000);
	let temp_max = $state(1200);
	let photo = $state<File | null>(null);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isValidHex = (c: string) => /^#[0-9A-Fa-f]{6}$/.test(c);
	const colourError = $derived(
		!isValidHex(colour_code) ? 'Invalid hex colour (e.g. #FF5500)' : null
	);

	async function uploadPhoto(variantId: string, file: File) {
		const formData = new FormData();
		formData.append('photo', file);
		const response = await fetch(`/api/photos/${variantId}`, {
			method: 'POST',
			body: formData
		});
		if (!response.ok) {
			throw new Error('Failed to upload photo');
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (colourError) {
			error = colourError;
			return;
		}

		submitting = true;
		error = null;

		try {
			const result = await createGlaze({
				name,
				foodsafe,
				watertight,
				notes: notes || undefined,
				colour_code,
				temp_min,
				temp_max
			});

			if (photo) {
				await uploadPhoto(result.variantId, photo);
			}

			goto(`/glazes/${result.glazeId}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create glaze';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Glaze - GlazeDB</title>
</svelte:head>

<div class="max-w-2xl">
	<h1 class="text-3xl font-bold mb-8">New Glaze</h1>

	<form onsubmit={handleSubmit} class="space-y-6">
		{#if error}
			<div class="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
				{error}
			</div>
		{/if}

		<div>
			<label for="name" class="block text-sm font-medium mb-1">Name *</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				required
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-glaze-500 focus:border-transparent"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="foodsafe" class="block text-sm font-medium mb-1">Food safe</label>
				<select
					id="foodsafe"
					bind:value={foodsafe}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-glaze-500 focus:border-transparent"
				>
					<option value={null}>Unknown</option>
					<option value={true}>Yes</option>
					<option value={false}>No</option>
				</select>
			</div>
			<label class="flex items-center gap-2 self-end pb-2">
				<input
					type="checkbox"
					bind:checked={watertight}
					class="w-4 h-4 rounded text-glaze-600 focus:ring-glaze-500"
				/>
				<span>Watertight</span>
			</label>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium mb-1">Notes</label>
			<textarea
				id="notes"
				bind:value={notes}
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-glaze-500 focus:border-transparent"
			></textarea>
		</div>

		<hr class="border-gray-200 dark:border-gray-700" />

		<h2 class="text-xl font-semibold">Firing Details</h2>

		<div>
			<label for="colour" class="block text-sm font-medium mb-1">Colour</label>
			<ColourPicker id="colour" bind:value={colour_code} />
			{#if colourError}
				<p class="mt-1 text-sm text-red-600 dark:text-red-400">{colourError}</p>
			{/if}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="temp_min" class="block text-sm font-medium mb-1">Min Temperature (°C) *</label>
				<input
					type="number"
					id="temp_min"
					bind:value={temp_min}
					required
					min="0"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-glaze-500 focus:border-transparent"
				/>
			</div>
			<div>
				<label for="temp_max" class="block text-sm font-medium mb-1">Max Temperature (°C) *</label>
				<input
					type="number"
					id="temp_max"
					bind:value={temp_max}
					required
					min="0"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-glaze-500 focus:border-transparent"
				/>
			</div>
		</div>

		<div>
			<label for="photo" class="block text-sm font-medium mb-1">Sample Photo</label>
			<PhotoUpload bind:file={photo} />
		</div>

		<div class="flex gap-4 pt-4">
			<button
				type="submit"
				disabled={submitting || !!colourError}
				class="px-6 py-2 bg-glaze-600 text-white rounded-lg hover:bg-glaze-700 disabled:opacity-50 transition-colors"
			>
				{submitting ? 'Creating...' : 'Create Glaze'}
			</button>
			<a
				href="/"
				class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
