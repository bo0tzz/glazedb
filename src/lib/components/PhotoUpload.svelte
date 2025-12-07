<script lang="ts">
	let {
		file = $bindable<File | null>(null),
		existingUrl = null as string | null,
		onClear = () => {}
	}: {
		file?: File | null;
		existingUrl?: string | null;
		onClear?: () => void;
	} = $props();

	let previewUrl = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	$effect(() => {
		if (file) {
			previewUrl = URL.createObjectURL(file);
			return () => {
				if (previewUrl) URL.revokeObjectURL(previewUrl);
			};
		} else {
			previewUrl = null;
		}
	});

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const selectedFile = input.files?.[0];
		if (selectedFile) {
			file = selectedFile;
		}
	}

	function clearPhoto() {
		file = null;
		if (fileInput) fileInput.value = '';
		onClear();
	}

	const displayUrl = $derived(previewUrl ?? existingUrl);
</script>

<div class="space-y-2">
	{#if displayUrl}
		<div class="relative inline-block">
			<img src={displayUrl} alt="Preview" class="max-w-xs max-h-48 rounded-lg object-cover" />
			<button
				type="button"
				onclick={clearPhoto}
				class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
				aria-label="Remove photo"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/if}
	<input
		type="file"
		accept="image/*"
		onchange={handleFileChange}
		bind:this={fileInput}
		class="hidden"
	/>
	<div class="flex items-center gap-3">
		<button
			type="button"
			onclick={() => fileInput?.click()}
			class="py-2 px-4 rounded-lg bg-glaze-100 dark:bg-glaze-900 text-glaze-700 dark:text-glaze-300 hover:bg-glaze-200 dark:hover:bg-glaze-800 text-sm"
		>
			Choose file
		</button>
		<span class="text-sm text-gray-600 dark:text-gray-400 truncate">
			{file?.name ?? 'No file chosen'}
		</span>
	</div>
</div>
