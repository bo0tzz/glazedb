<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		getGlaze,
		updateGlaze,
		deleteGlaze,
		addVariant,
		updateVariant,
		deleteVariant
	} from '$lib/glazes.remote';
	import PhotoUpload from '$lib/components/PhotoUpload.svelte';
	import ColourPicker from '$lib/components/ColourPicker.svelte';
	import type { GlazeVariantInfo } from '$lib/types';

	const id = $derived(page.params.id ?? '');
	const glazeQuery = $derived(getGlaze(id));

	let editing = $state(false);
	let editName = $state('');
	let editFoodsafe = $state<boolean | null>(null);
	let editWatertight = $state(false);
	let editNotes = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	let editingVariant = $state<string | null>(null);
	let variantColour = $state('#888888');
	let variantTempMin = $state(1000);
	let variantTempMax = $state(1200);
	let variantPhoto = $state<File | null>(null);
	let variantClearPhoto = $state(false);

	let addingVariant = $state(false);
	let newVariantColour = $state('#888888');
	let newVariantTempMin = $state(1000);
	let newVariantTempMax = $state(1200);
	let newVariantPhoto = $state<File | null>(null);

	let quickPhotoInput = $state<HTMLInputElement | undefined>(undefined);
	let uploadingQuickPhoto = $state(false);

	function startAddVariant(existingColour: string) {
		newVariantColour = existingColour;
		addingVariant = true;
	}

	function cancelAddVariant() {
		addingVariant = false;
	}

	async function uploadPhoto(variantId: string, file: File) {
		const formData = new FormData();
		formData.append('photo', file);
		await fetch(`/api/photos/${variantId}`, { method: 'POST', body: formData });
	}

	async function clearPhotoOnServer(variantId: string) {
		await fetch(`/api/photos/${variantId}`, { method: 'DELETE' });
	}

	async function handleQuickPhotoUpload(e: Event, variantId: string) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploadingQuickPhoto = true;
		try {
			await uploadPhoto(variantId, file);
			glazeQuery.refresh();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload photo';
		} finally {
			uploadingQuickPhoto = false;
			input.value = '';
		}
	}

	function startEdit(glaze: {
		name: string;
		foodsafe: boolean | null;
		watertight: boolean;
		notes: string | null;
	}) {
		editName = glaze.name;
		editFoodsafe = glaze.foodsafe;
		editWatertight = glaze.watertight;
		editNotes = glaze.notes ?? '';
		editing = true;
	}

	function startEditVariant(variant: GlazeVariantInfo) {
		editingVariant = variant.id;
		variantColour = variant.colour_code;
		variantTempMin = variant.temp_min;
		variantTempMax = variant.temp_max;
		variantPhoto = null;
		variantClearPhoto = false;
	}

	async function saveGlaze() {
		submitting = true;
		error = null;
		try {
			await updateGlaze({
				id,
				name: editName,
				foodsafe: editFoodsafe,
				watertight: editWatertight,
				notes: editNotes || undefined
			});
			editing = false;
			glazeQuery.refresh();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save';
		} finally {
			submitting = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Delete this glaze? This cannot be undone.')) return;
		submitting = true;
		try {
			await deleteGlaze(id);
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete';
			submitting = false;
		}
	}

	async function saveVariant() {
		if (!editingVariant) return;
		submitting = true;
		error = null;
		try {
			await updateVariant({
				id: editingVariant,
				colour_code: variantColour,
				temp_min: variantTempMin,
				temp_max: variantTempMax
			});

			if (variantClearPhoto) {
				await clearPhotoOnServer(editingVariant);
			} else if (variantPhoto) {
				await uploadPhoto(editingVariant, variantPhoto);
			}

			editingVariant = null;
			glazeQuery.refresh();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save variant';
		} finally {
			submitting = false;
		}
	}

	async function handleDeleteVariant(variantId: string) {
		if (!confirm('Delete this variant?')) return;
		submitting = true;
		error = null;
		try {
			await deleteVariant(variantId);
			glazeQuery.refresh();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete variant';
		} finally {
			submitting = false;
		}
	}

	async function handleAddVariant() {
		submitting = true;
		error = null;
		try {
			const result = await addVariant({
				glaze_id: id,
				colour_code: newVariantColour,
				temp_min: newVariantTempMin,
				temp_max: newVariantTempMax
			});

			if (newVariantPhoto) {
				await uploadPhoto(result.id, newVariantPhoto);
			}

			addingVariant = false;
			newVariantColour = '#888888';
			newVariantTempMin = 1000;
			newVariantTempMax = 1200;
			newVariantPhoto = null;
			glazeQuery.refresh();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add variant';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Glaze - GlazeDB</title>
</svelte:head>

{#await glazeQuery}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:then glaze}
	{#if !glaze}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400 mb-4">Glaze not found</p>
			<a href="/" class="text-glaze-600 dark:text-glaze-400 hover:underline">Back to glazes</a>
		</div>
	{:else}
		<div class="max-w-4xl">
			{#if error}
				<div class="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
					{error}
				</div>
			{/if}

			<div class="flex items-start justify-between mb-6">
				<div>
					<div class="text-sm mb-2">
						<a href="/" class="text-glaze-600 dark:text-glaze-400 hover:underline"
							>&larr; Back to glazes</a
						>
					</div>
					{#if editing}
						<input
							type="text"
							bind:value={editName}
							class="text-3xl font-bold bg-transparent border-b-2 border-glaze-500 focus:outline-none"
						/>
					{:else}
						<h1 class="text-3xl font-bold">{glaze.name}</h1>
					{/if}
				</div>
				<div class="flex gap-2">
					{#if editing}
						<button
							onclick={saveGlaze}
							disabled={submitting}
							class="px-4 py-2 bg-glaze-600 text-white rounded-lg hover:bg-glaze-700 disabled:opacity-50"
						>
							Save
						</button>
						<button
							onclick={() => (editing = false)}
							class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
						>
							Cancel
						</button>
					{:else}
						<a
							href="/glazes/new"
							class="px-4 py-2 bg-glaze-600 text-white rounded-lg hover:bg-glaze-700"
						>
							New
						</a>
						<button
							onclick={() => startEdit(glaze)}
							class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
						>
							Edit
						</button>
						<button
							onclick={handleDelete}
							disabled={submitting}
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
						>
							Delete
						</button>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
				<div>
					<h2 class="text-lg font-semibold mb-4">Details</h2>
					<dl class="space-y-3">
						<div class="flex flex-wrap gap-4">
							{#if editing}
								<div>
									<label for="edit-foodsafe" class="block text-sm mb-1">Food safe</label>
									<select
										id="edit-foodsafe"
										bind:value={editFoodsafe}
										class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
									>
										<option value={null}>Unknown</option>
										<option value={true}>Yes</option>
										<option value={false}>No</option>
									</select>
								</div>
								<label class="flex items-center gap-2 self-end pb-2">
									<input type="checkbox" bind:checked={editWatertight} class="w-4 h-4 rounded" />
									<span>Watertight</span>
								</label>
							{:else}
								{#if glaze.foodsafe === true}
									<span
										class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
									>
										Food safe
									</span>
								{:else if glaze.foodsafe === false}
									<span
										class="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm"
									>
										Not food safe
									</span>
								{/if}
								{#if glaze.watertight}
									<span
										class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
									>
										Watertight
									</span>
								{/if}
								{#if glaze.foodsafe === null && !glaze.watertight}
									<span class="text-gray-500 text-sm">No special properties</span>
								{/if}
							{/if}
						</div>
						<div>
							<dt class="text-sm text-gray-500 dark:text-gray-400">Notes</dt>
							{#if editing}
								<textarea
									bind:value={editNotes}
									rows="4"
									class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
								></textarea>
							{:else}
								<dd class="whitespace-pre-wrap">{glaze.notes || 'No notes'}</dd>
							{/if}
						</div>
					</dl>
				</div>

				<div>
					{#if glaze.variants[0]?.photo}
						<img
							src="/api/photos/{glaze.variants[0].id}"
							alt={glaze.name}
							class="w-full rounded-lg"
						/>
					{:else}
						<input
							type="file"
							accept="image/*"
							bind:this={quickPhotoInput}
							onchange={(e) => handleQuickPhotoUpload(e, glaze.variants[0].id)}
							class="hidden"
						/>
						<button
							type="button"
							onclick={() => quickPhotoInput?.click()}
							disabled={uploadingQuickPhoto}
							class="w-full aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity disabled:cursor-wait"
							style="background-color: {glaze.variants[0]?.colour_code ?? '#888'}"
						>
							{#if uploadingQuickPhoto}
								<span class="text-white text-opacity-70">Uploading...</span>
							{:else}
								<svg
									class="w-8 h-8 text-white text-opacity-50 mb-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<span class="text-white text-opacity-50">Click to add photo</span>
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<hr class="border-gray-200 dark:border-gray-700 my-8" />

			<div>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Variants</h2>
					<button
						onclick={() =>
							addingVariant
								? cancelAddVariant()
								: startAddVariant(glaze.variants[0]?.colour_code ?? '#888888')}
						class="text-sm text-glaze-600 dark:text-glaze-400 hover:underline"
					>
						{addingVariant ? 'Cancel' : '+ Add variant'}
					</button>
				</div>

				{#if addingVariant}
					<div
						class="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
					>
						<h3 class="font-medium mb-4">New Variant</h3>
						<div class="mb-4">
							<label for="new-colour" class="block text-sm mb-1">Colour</label>
							<ColourPicker id="new-colour" bind:value={newVariantColour} />
						</div>
						<div class="grid grid-cols-2 gap-4 mb-4">
							<div>
								<label for="new-temp-min" class="block text-sm mb-1">Min Temp (°C)</label>
								<input
									type="number"
									id="new-temp-min"
									bind:value={newVariantTempMin}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
								/>
							</div>
							<div>
								<label for="new-temp-max" class="block text-sm mb-1">Max Temp (°C)</label>
								<input
									type="number"
									id="new-temp-max"
									bind:value={newVariantTempMax}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
								/>
							</div>
						</div>
						<div class="mb-4">
							<label for="new-photo" class="block text-sm mb-1">Photo</label>
							<PhotoUpload bind:file={newVariantPhoto} />
						</div>
						<button
							onclick={handleAddVariant}
							disabled={submitting}
							class="px-4 py-2 bg-glaze-600 text-white rounded-lg hover:bg-glaze-700 disabled:opacity-50"
						>
							Add Variant
						</button>
					</div>
				{/if}

				<div class="space-y-4">
					{#each glaze.variants as variant (variant.id)}
						<div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
							{#if editingVariant === variant.id}
								<div class="space-y-4">
									<div class="mb-4">
										<label for="edit-colour-{variant.id}" class="block text-sm mb-1">Colour</label>
										<ColourPicker id="edit-colour-{variant.id}" bind:value={variantColour} />
									</div>
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label for="edit-temp-min-{variant.id}" class="block text-sm mb-1"
												>Min Temp (°C)</label
											>
											<input
												type="number"
												id="edit-temp-min-{variant.id}"
												bind:value={variantTempMin}
												class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
											/>
										</div>
										<div>
											<label for="edit-temp-max-{variant.id}" class="block text-sm mb-1"
												>Max Temp (°C)</label
											>
											<input
												type="number"
												id="edit-temp-max-{variant.id}"
												bind:value={variantTempMax}
												class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
											/>
										</div>
									</div>
									<div>
										<label for="edit-photo-{variant.id}" class="block text-sm mb-1">Photo</label>
										<PhotoUpload
											bind:file={variantPhoto}
											existingUrl={variant.photo ? `/api/photos/${variant.id}` : null}
											onClear={() => (variantClearPhoto = true)}
										/>
									</div>
									<div class="flex gap-2">
										<button
											onclick={saveVariant}
											disabled={submitting}
											class="px-4 py-2 bg-glaze-600 text-white rounded-lg hover:bg-glaze-700 disabled:opacity-50"
										>
											Save
										</button>
										<button
											onclick={() => (editingVariant = null)}
											class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
										>
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<div class="flex items-center gap-4">
									<div
										class="w-12 h-12 rounded-lg flex-shrink-0"
										style="background-color: {variant.colour_code}"
									></div>
									{#if variant.photo}
										<img
											src="/api/photos/{variant.id}"
											alt="Variant"
											class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
										/>
									{/if}
									<div class="flex-1">
										<div class="font-mono text-sm">{variant.colour_code}</div>
										<div class="text-gray-600 dark:text-gray-400">
											{variant.temp_min} - {variant.temp_max}°C
										</div>
									</div>
									<div class="flex gap-2">
										<button
											onclick={() => startEditVariant(variant)}
											class="text-sm text-glaze-600 dark:text-glaze-400 hover:underline"
										>
											Edit
										</button>
										{#if glaze.variants.length > 1}
											<button
												onclick={() => handleDeleteVariant(variant.id)}
												class="text-sm text-red-600 dark:text-red-400 hover:underline"
											>
												Delete
											</button>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
{:catch err}
	<div class="text-center py-12 text-red-500">Error: {err.message}</div>
{/await}
