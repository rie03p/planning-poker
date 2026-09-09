import {expect, test} from '@playwright/test';
import {join, issue, openIssues, closeIssues} from './helpers';

test('reorder issues with pointer and keyboard, synchronize peers and preserve voting', async ({
  page,
  browser,
  isMobile,
}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Start new game'}).click();
  await join(page, 'Alice');
  const guestContext = await browser.newContext({viewport: page.viewportSize()!});
  const guest = await guestContext.newPage();
  try {
    await guest.goto(page.url());
    await join(guest, 'Bob');
    await openIssues(page);
    await openIssues(guest);
    await page.getByPlaceholder('Issue title').filter({visible: true}).fill('First\nSecond\nThird');
    await page.getByRole('button', {name: 'Add Issue', exact: true}).click();
    await expect(issue(guest, 'Third')).toBeVisible();
    await closeIssues(page);
    await page.getByRole('button', {name: 'Vote M', exact: true}).click();
    await openIssues(page);

    const handle = page.getByRole('button', {name: 'Reorder Third', exact: true});
    await handle.click({trial: true});
    const start = (await handle.boundingBox())!;
    const target = (await issue(page, 'First').boundingBox())!;
    const x = start.x + start.width / 2;
    const fromY = start.y + start.height / 2;
    const toY = target.y + target.height / 2;
    if (isMobile) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{x, y: fromY}],
      });
      // Hold the handle long enough to activate a touch drag.
      await page.waitForTimeout(300);
      for (let step = 1; step <= 20; step++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{x, y: fromY + ((toY - fromY) * step) / 20}],
        });
      }
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
      await cdp.detach();
    } else {
      await page.mouse.move(x, fromY);
      await page.mouse.down();
      await page.mouse.move(x, toY, {steps: 20});
      await page.mouse.up();
    }

    const groups = (participantPage: typeof page) =>
      participantPage.getByRole('group', {name: /^Issue:/});
    for (const participantPage of [page, guest]) {
      await expect(groups(participantPage)).toHaveText([/Third/, /First/, /Second/]);
      await expect(
        issue(participantPage, 'First').getByRole('button', {name: 'Voting now...'}),
      ).toBeDisabled();
    }
    await expect(page.getByRole('dialog', {name: 'Edit Issue'})).toHaveCount(0);

    // The same handle supports keyboard sorting and cancellation.
    await expect(issue(page, 'Third')).not.toHaveAttribute('data-dnd-dropping');
    await expect(issue(page, 'Third')).not.toHaveAttribute('data-dnd-dragging');
    await handle.focus();
    await page.keyboard.press('Space');
    await expect(handle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(groups(page)).toHaveText([/First/, /Third/, /Second/]);
    await page.keyboard.press('Space');
    await expect(groups(guest)).toHaveText([/First/, /Third/, /Second/]);
    await expect(issue(page, 'Third')).not.toHaveAttribute('data-dnd-dropping');
    await expect(issue(page, 'Third')).not.toHaveAttribute('data-dnd-dragging');
    await page.getByRole('button', {name: 'Reorder Second', exact: true}).focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', {name: 'Reorder Second', exact: true})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.keyboard.press('ArrowUp');
    await expect(groups(page)).toHaveText([/First/, /Second/, /Third/]);
    await page.keyboard.press('Escape');
    await expect(groups(page)).toHaveText([/First/, /Third/, /Second/]);

    await closeIssues(page);
    await expect(page.getByRole('button', {name: 'Vote M', exact: true})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', {name: 'Reveal votes', exact: true}).click();
    await expect(page.getByText('Total votes: 1', {exact: true})).toBeVisible();
    await guest.reload();
    await expect(guest.getByText('Total votes: 1', {exact: true})).toBeVisible();
    await openIssues(guest);
    await expect(groups(guest)).toHaveText([/First/, /Third/, /Second/]);
    await page.getByRole('button', {name: 'Vote next issue', exact: true}).click();
    await expect(issue(guest, 'Third').getByRole('button', {name: 'Voting now...'})).toBeDisabled();
    await issue(guest, 'First').getByRole('button', {name: 'View voting results'}).click();
    const results = guest.getByRole('dialog', {name: 'First', exact: true});
    await expect(results.getByText('Total votes: 1', {exact: true})).toBeVisible();
    await expect(results.getByText('M', {exact: true})).toBeVisible();
  } finally {
    await guestContext.close();
  }
});
