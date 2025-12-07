<script lang="ts">
	type ChartData = {
		id: string;
		name: string;
		variants: { colour_code: string; temp_min: number; temp_max: number }[];
	}[];

	let { data }: { data: ChartData } = $props();

	// Sort by minimum temperature (lowest first)
	const sortedData = $derived(
		[...data].sort((a, b) => {
			const aMin = Math.min(...a.variants.map((v) => v.temp_min));
			const bMin = Math.min(...b.variants.map((v) => v.temp_min));
			return aMin - bMin;
		})
	);

	const baseRowHeight = 40;
	const variantBarHeight = 18;
	const variantSpacing = 4;
	const labelWidth = 150;
	const padding = { top: 30, right: 20, bottom: 40, left: labelWidth };

	// Calculate row height based on number of variants
	function getRowHeight(variantCount: number): number {
		if (variantCount <= 1) return baseRowHeight;
		return baseRowHeight + ((variantCount - 1) * (variantBarHeight + variantSpacing)) / 2;
	}

	// Calculate cumulative Y positions for each glaze row
	const rowPositions = $derived(() => {
		const positions: number[] = [];
		let y = padding.top;
		for (const glaze of sortedData) {
			positions.push(y);
			y += getRowHeight(glaze.variants.length);
		}
		return positions;
	});

	const allTemps = $derived(
		sortedData.flatMap((g) => g.variants.flatMap((v) => [v.temp_min, v.temp_max]))
	);
	const minTemp = $derived(allTemps.length > 0 ? Math.min(...allTemps) : 800);
	const maxTemp = $derived(allTemps.length > 0 ? Math.max(...allTemps) : 1300);

	const tempRange = $derived(maxTemp - minTemp || 100);
	const chartMinTemp = $derived(Math.floor((minTemp - tempRange * 0.05) / 50) * 50);
	const chartMaxTemp = $derived(Math.ceil((maxTemp + tempRange * 0.05) / 50) * 50);

	const chartWidth = 800;
	const chartHeight = $derived(() => {
		const positions = rowPositions();
		if (positions.length === 0) return padding.top + padding.bottom + baseRowHeight;
		const lastGlazeHeight = getRowHeight(sortedData[sortedData.length - 1]?.variants.length ?? 1);
		return positions[positions.length - 1] + lastGlazeHeight + padding.bottom;
	});
	const plotWidth = $derived(chartWidth - padding.left - padding.right);

	function tempToX(temp: number): number {
		return padding.left + ((temp - chartMinTemp) / (chartMaxTemp - chartMinTemp)) * plotWidth;
	}

	const ticks = $derived(() => {
		const result: number[] = [];
		const step = 50;
		for (let t = chartMinTemp; t <= chartMaxTemp; t += step) {
			result.push(t);
		}
		return result;
	});
</script>

<svg
	viewBox="0 0 {chartWidth} {chartHeight()}"
	class="w-full max-w-4xl"
	style="font-family: system-ui, sans-serif;"
>
	<!-- Grid lines -->
	{#each ticks() as temp}
		<line
			x1={tempToX(temp)}
			y1={padding.top}
			x2={tempToX(temp)}
			y2={chartHeight() - padding.bottom}
			stroke="currentColor"
			stroke-opacity="0.1"
		/>
	{/each}

	<!-- X axis -->
	<line
		x1={padding.left}
		y1={chartHeight() - padding.bottom}
		x2={chartWidth - padding.right}
		y2={chartHeight() - padding.bottom}
		stroke="currentColor"
		stroke-opacity="0.3"
	/>

	<!-- X axis ticks and labels -->
	{#each ticks() as temp}
		<line
			x1={tempToX(temp)}
			y1={chartHeight() - padding.bottom}
			x2={tempToX(temp)}
			y2={chartHeight() - padding.bottom + 5}
			stroke="currentColor"
			stroke-opacity="0.5"
		/>
		<text
			x={tempToX(temp)}
			y={chartHeight() - padding.bottom + 20}
			text-anchor="middle"
			font-size="12"
			fill="currentColor"
			fill-opacity="0.7"
		>
			{temp}°C
		</text>
	{/each}

	<!-- Rows -->
	{#each sortedData as glaze, i}
		{@const rowY = rowPositions()[i]}
		{@const rowH = getRowHeight(glaze.variants.length)}
		{@const centerY = rowY + rowH / 2}

		<!-- Glaze name -->
		<text
			x={padding.left - 10}
			y={centerY + 4}
			text-anchor="end"
			font-size="14"
			fill="currentColor"
		>
			{glaze.name.length > 18 ? glaze.name.slice(0, 18) + '...' : glaze.name}
		</text>

		<!-- Variant bars - stacked vertically with small offset -->
		{#each glaze.variants as variant, vi}
			{@const totalBarsHeight =
				glaze.variants.length * variantBarHeight + (glaze.variants.length - 1) * variantSpacing}
			{@const barY = centerY - totalBarsHeight / 2 + vi * (variantBarHeight + variantSpacing)}
			<rect
				x={tempToX(variant.temp_min)}
				y={barY}
				width={Math.max(tempToX(variant.temp_max) - tempToX(variant.temp_min), 2)}
				height={variantBarHeight}
				rx="3"
				fill={variant.colour_code}
			/>
		{/each}

		<!-- Row separator -->
		{#if i < sortedData.length - 1}
			<line
				x1={padding.left}
				y1={rowY + rowH}
				x2={chartWidth - padding.right}
				y2={rowY + rowH}
				stroke="currentColor"
				stroke-opacity="0.1"
			/>
		{/if}
	{/each}

	<!-- Chart title -->
	<text
		x={chartWidth / 2}
		y="18"
		text-anchor="middle"
		font-size="16"
		font-weight="600"
		fill="currentColor"
	>
		Temperature Ranges
	</text>
</svg>
