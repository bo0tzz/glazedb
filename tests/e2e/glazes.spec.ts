import { test, expect } from '@playwright/test';

test.describe('Glazes', () => {
	test('home page loads', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Glazes');
	});

	test('shows empty state when no glazes', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('No glazes yet')).toBeVisible();
	});

	test('can navigate to new glaze page', async ({ page }) => {
		await page.goto('/');
		await page.click('text=Add Glaze');
		await expect(page.locator('h1')).toContainText('New Glaze');
	});

	test('can create a new glaze', async ({ page }) => {
		await page.goto('/glazes/new');

		await page.fill('input[id="name"]', 'Test Glaze');
		await page.fill('input[id="temp_min"]', '1000');
		await page.fill('input[id="temp_max"]', '1200');

		await page.click('button[type="submit"]');

		// Should redirect to glaze detail page
		await expect(page.locator('h1')).toContainText('Test Glaze');
	});

	test('chart page loads', async ({ page }) => {
		await page.goto('/chart');
		await expect(page.locator('h1')).toContainText('Temperature Chart');
	});
});

test.describe('Theme', () => {
	test('can toggle dark mode', async ({ page }) => {
		await page.goto('/');

		// Initially should respect system preference, but let's just toggle
		const html = page.locator('html');
		const initialDark = await html.evaluate((el) => el.classList.contains('dark'));

		// Click theme toggle
		await page.click('button[aria-label="Toggle theme"]');

		const afterToggle = await html.evaluate((el) => el.classList.contains('dark'));
		expect(afterToggle).not.toBe(initialDark);
	});
});
