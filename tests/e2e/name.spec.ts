import {expect, test} from '@playwright/test';
import {join} from './helpers';

test('change display name without losing votes or spectator state', async ({page, browser}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Start new game'}).click();
  await join(page, 'Alice');
  const guestContext = await browser.newContext({viewport: page.viewportSize()!});
  const guest = await guestContext.newPage();
  try {
    await guest.goto(page.url());
    await join(guest, 'Bob');
    await page.getByRole('button', {name: 'Vote M', exact: true}).click();
    await expect(guest.getByText('✓', {exact: true})).toHaveCount(1);
    const userId = await page.evaluate(() => localStorage.getItem('planning-poker:userId'));

    await page.getByRole('button', {name: 'Player settings'}).click();
    await page.getByRole('menuitem', {name: 'Change name', exact: true}).click();
    const dialog = page.getByRole('dialog', {name: 'Change your display name'});
    await expect(dialog.getByPlaceholder('Your name')).toHaveValue('Alice');
    await dialog.getByPlaceholder('Your name').fill('Temporary');
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(guest.getByText('Alice', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Player settings'}).click();
    await page.getByRole('menuitem', {name: 'Change name', exact: true}).click();
    await expect(dialog.getByPlaceholder('Your name')).toHaveValue('Alice');
    await dialog.getByPlaceholder('Your name').fill(' ');
    await expect(dialog.getByRole('button', {name: 'Change name', exact: true})).toBeDisabled();
    await dialog.getByPlaceholder('Your name').fill('a'.repeat(21));
    await dialog.getByRole('button', {name: 'Change name', exact: true}).click();
    await expect(dialog.getByText('Name must be at most 20 characters')).toBeVisible();
    await dialog.getByPlaceholder('Your name').fill('ありす');
    await dialog
      .getByPlaceholder('Your name')
      .dispatchEvent('keydown', {key: 'Enter', isComposing: true});
    await expect(dialog).toBeVisible();
    await expect(guest.getByText('Alice', {exact: true})).toBeVisible();
    await dialog.getByPlaceholder('Your name').fill('  Alicia  ');
    await dialog.getByRole('button', {name: 'Change name', exact: true}).click();
    await expect(dialog).toBeHidden();
    await expect(guest.getByText('Alicia', {exact: true})).toBeVisible();
    await expect(guest.getByText('Alice', {exact: true})).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Vote M', exact: true})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await page.evaluate(() => localStorage.getItem('planning-poker:userId'))).toBe(userId);
    await expect(guest.getByText('✓', {exact: true})).toHaveCount(1);

    await page.getByRole('button', {name: 'Player settings'}).click();
    await page.getByRole('menuitem', {name: 'Switch to Spectator', exact: true}).click();
    await expect(page.getByText('You are in spectator mode')).toBeVisible();
    await page.getByRole('button', {name: 'Player settings'}).click();
    await page.getByRole('menuitem', {name: 'Change name', exact: true}).click();
    await dialog.getByPlaceholder('Your name').fill('Observer');
    await dialog.getByRole('button', {name: 'Change name', exact: true}).click();
    await expect(guest.getByText('Observer', {exact: true})).toBeVisible();
    await expect(page.getByText('You are in spectator mode')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Observer', {exact: true})).toBeVisible();
  } finally {
    await guestContext.close();
  }
});
