import {expect, type Page} from '@playwright/test';

export async function join(page: Page, name: string) {
  await page.getByPlaceholder('Your name').fill(name);
  await page.getByRole('button', {name: 'Join game', exact: true}).click();
  await expect(page.getByText(name, {exact: true})).toBeVisible();
}

export function issue(page: Page, title: string) {
  return page.getByRole('group', {name: `Issue: ${title}`, exact: true});
}

export async function openIssues(page: Page) {
  await page.getByRole('button', {name: 'Toggle issues menu'}).click();
  await expect(page.getByRole('button', {name: 'Add Issue', exact: true})).toBeVisible();
}

export async function closeIssues(page: Page) {
  await page.getByRole('button', {name: 'Close issues'}).click();
}
