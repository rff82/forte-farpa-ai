// forte · tests/e2e/basic.spec.ts · 2026-04-19
// Smoke E2E — login render, dashboard render, toggle alto contraste (U2), bilinguismo (U1)
import { test, expect } from '@playwright/test';

test('landing carrega e expõe toggle alto contraste (U2)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#btn-alto-contraste')).toBeVisible();
});

test('login page carrega', async ({ page }) => {
  await page.goto('/login.html');
  await expect(page.locator('form, input[type="email"]').first()).toBeVisible();
});

test('toggle alto contraste persiste em localStorage (farpa-tema)', async ({ page }) => {
  await page.goto('/');
  await page.click('#btn-alto-contraste');
  const tema = await page.evaluate(() => localStorage.getItem('farpa-tema'));
  expect(tema).toBeTruthy();
});

test('demo page é pública e marca dados fictícios', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.locator('[data-i18n="demo.fictional"]')).toBeVisible();
});
