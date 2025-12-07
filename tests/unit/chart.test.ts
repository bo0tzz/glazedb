import { describe, it, expect } from 'vitest';

// Test helper functions that would be used in TemperatureChart
describe('Temperature Chart calculations', () => {
	function calculateTempRange(data: { variants: { temp_min: number; temp_max: number }[] }[]): {
		min: number;
		max: number;
	} {
		const allTemps = data.flatMap((g) => g.variants.flatMap((v) => [v.temp_min, v.temp_max]));
		if (allTemps.length === 0) return { min: 800, max: 1300 };
		return { min: Math.min(...allTemps), max: Math.max(...allTemps) };
	}

	function roundToNearestFifty(value: number, direction: 'floor' | 'ceil'): number {
		return direction === 'floor' ? Math.floor(value / 50) * 50 : Math.ceil(value / 50) * 50;
	}

	it('calculates correct temp range for empty data', () => {
		const range = calculateTempRange([]);
		expect(range.min).toBe(800);
		expect(range.max).toBe(1300);
	});

	it('calculates correct temp range for single glaze', () => {
		const data = [
			{
				variants: [{ temp_min: 1000, temp_max: 1200 }]
			}
		];
		const range = calculateTempRange(data);
		expect(range.min).toBe(1000);
		expect(range.max).toBe(1200);
	});

	it('calculates correct temp range for multiple glazes with variants', () => {
		const data = [
			{
				variants: [
					{ temp_min: 900, temp_max: 1100 },
					{ temp_min: 1050, temp_max: 1250 }
				]
			},
			{
				variants: [{ temp_min: 1200, temp_max: 1300 }]
			}
		];
		const range = calculateTempRange(data);
		expect(range.min).toBe(900);
		expect(range.max).toBe(1300);
	});

	it('rounds temperatures to nearest 50', () => {
		expect(roundToNearestFifty(923, 'floor')).toBe(900);
		expect(roundToNearestFifty(923, 'ceil')).toBe(950);
		expect(roundToNearestFifty(1000, 'floor')).toBe(1000);
		expect(roundToNearestFifty(1000, 'ceil')).toBe(1000);
	});
});
