import {expect, test} from '@playwright/test';

import {join, issue, openIssues, closeIssues} from './helpers';

test('two participants create, edit, vote, reveal, vote again, advance and delete issues', async ({
  page,
  browser,
}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Start new game'}).click();
  await expect(page).toHaveURL(/\/[0-9a-f-]+$/);
  await join(page, 'Alice');

  const guestContext = await browser.newContext({viewport: page.viewportSize()!});
  const guest = await guestContext.newPage();
  try {
    await guest.goto(page.url());
    await join(guest, 'Bob');
    await expect(page.getByText('Bob', {exact: true})).toBeVisible();
    await expect(guest.getByText('Alice', {exact: true})).toBeVisible();

    await openIssues(page);
    await openIssues(guest);
    await page
      .getByPlaceholder('Issue title', {exact: true})
      .filter({visible: true})
      .fill('First issue\nSecond issue\nThird issue');
    await page.getByRole('button', {name: 'Add Issue', exact: true}).click();
    await expect(issue(guest, 'Third issue')).toBeVisible();

    await issue(page, 'First issue').getByText('First issue', {exact: true}).click();
    await page.getByPlaceholder('Add a description...').fill('An issue to estimate together.');
    await page.getByRole('button', {name: 'Save', exact: true}).click();
    await issue(guest, 'First issue').getByText('First issue', {exact: true}).click();
    await expect(guest.getByPlaceholder('Add a description...')).toHaveValue(
      'An issue to estimate together.',
    );
    await guest.getByRole('button', {name: 'Cancel', exact: true}).click();
    await closeIssues(page);
    await closeIssues(guest);

    await page.getByRole('button', {name: 'Vote M', exact: true}).click();
    await guest.getByRole('button', {name: 'Vote L', exact: true}).click();
    await expect(page.getByText('✓', {exact: true})).toHaveCount(2);
    await page.getByRole('button', {name: 'Reveal votes', exact: true}).click();
    await expect(page.getByText('Total votes: 2', {exact: true})).toBeVisible();
    await expect(guest.getByText('Total votes: 2', {exact: true})).toBeVisible();

    await openIssues(page);
    await openIssues(guest);
    await expect(
      issue(guest, 'First issue').getByRole('button', {name: 'Vote again', exact: true}),
    ).toBeEnabled();
    await issue(page, 'First issue').getByRole('button', {name: 'Vote again', exact: true}).click();
    for (const participantPage of [page, guest]) {
      await expect(
        issue(participantPage, 'First issue').getByRole('button', {name: 'Voting now...'}),
      ).toBeDisabled();
      await closeIssues(participantPage);
      await expect(participantPage.getByText('Pick your cards!', {exact: true})).toBeVisible();
      await expect(
        participantPage.getByRole('button', {name: 'Vote M', exact: true}),
      ).toHaveAttribute('aria-pressed', 'false');
      await expect(
        participantPage.getByRole('button', {name: 'Vote L', exact: true}),
      ).toHaveAttribute('aria-pressed', 'false');
    }
    await page.getByRole('button', {name: 'Vote S', exact: true}).click();
    await guest.getByRole('button', {name: 'Vote XL', exact: true}).click();
    await expect(page.getByText('✓', {exact: true})).toHaveCount(2);
    await page.getByRole('button', {name: 'Reveal votes', exact: true}).click();
    await expect(page.getByText('Total votes: 2', {exact: true})).toBeVisible();
    await expect(guest.getByText('Total votes: 2', {exact: true})).toBeVisible();

    await page.getByRole('button', {name: 'Vote next issue', exact: true}).click();
    await openIssues(page);
    await openIssues(guest);
    await expect(
      issue(guest, 'Second issue').getByRole('button', {name: 'Voting now...'}),
    ).toBeDisabled();

    await issue(page, 'First issue').getByRole('button', {name: 'View voting results'}).click();
    const results = page.getByRole('dialog', {name: 'First issue', exact: true});
    await expect(results.getByText('Total votes: 2', {exact: true})).toBeVisible();
    await expect(results.getByText('S', {exact: true})).toBeVisible();
    await expect(results.getByText('XL', {exact: true})).toBeVisible();
    await expect(results.getByText('L', {exact: true})).toHaveCount(0);
    await expect(results.getByText('M', {exact: true})).toHaveCount(0);
    await page.keyboard.press('Escape');

    // Cancel and Escape must preserve all issues in both deletion modes.
    for (const dismiss of ['Cancel', 'Escape']) {
      for (const deleteAll of [false, true]) {
        if (deleteAll) {
          await page.getByRole('button', {name: 'Options', exact: true}).click();
          await page.getByRole('menuitem', {name: 'Delete all issues'}).click();
        } else {
          await issue(page, 'Third issue').getByRole('button', {name: 'Remove issue'}).click();
        }
        const dialog = page.getByRole('dialog', {
          name: deleteAll ? 'Delete All Issues' : 'Delete Issue',
          exact: true,
        });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText(/This action cannot be undone\./)).toBeVisible();
        if (dismiss === 'Cancel') {
          await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
        } else {
          await page.keyboard.press('Escape');
        }
        await expect(dialog).not.toBeVisible();
        for (const participantPage of [page, guest]) {
          await expect(participantPage.getByRole('group', {name: /^Issue:/})).toHaveCount(3);
        }
      }
    }

    await issue(page, 'Third issue')
      .getByRole('button', {name: 'Remove issue', exact: true})
      .click();
    await page.getByRole('button', {name: 'Delete', exact: true}).click();
    await expect(issue(guest, 'Third issue')).toHaveCount(0);
    await expect(issue(guest, 'First issue')).toBeVisible();
    await expect(issue(guest, 'Second issue')).toBeVisible();
    await page.getByRole('button', {name: 'Options', exact: true}).click();
    await page.getByRole('menuitem', {name: 'Delete all issues'}).click();
    await page.getByRole('button', {name: 'Delete All', exact: true}).click();
    await expect(
      guest.getByText('No issues registered yet.').filter({visible: true}),
    ).toBeVisible();
  } finally {
    await guestContext.close();
  }
});

test('next issue skips completed rounds and still includes unfinished revotes', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Start new game'}).click();
  await join(page, 'Alice');
  await openIssues(page);
  await page.getByPlaceholder('Issue title').filter({visible: true}).fill('First\nDone\nLast');
  await page.getByRole('button', {name: 'Add Issue', exact: true}).click();
  await expect(issue(page, 'Last')).toBeVisible();
  await closeIssues(page);

  const selectIssue = async (title: string) => {
    await openIssues(page);
    await issue(page, title).getByRole('button', {name: 'Vote this issue', exact: true}).click();
    await expect(issue(page, title).getByRole('button', {name: 'Voting now...'})).toBeDisabled();
    await closeIssues(page);
  };
  const revealVote = async () => {
    await page.getByRole('button', {name: 'Vote M', exact: true}).click();
    await page.getByRole('button', {name: 'Reveal votes', exact: true}).click();
    await expect(page.getByText('Total votes: 1', {exact: true})).toBeVisible();
  };

  await selectIssue('Done');
  await revealVote();
  await selectIssue('First');
  await revealVote();
  await page.getByRole('button', {name: 'Vote next issue', exact: true}).click();
  await openIssues(page);
  await expect(issue(page, 'Last').getByRole('button', {name: 'Voting now...'})).toBeDisabled();
  await closeIssues(page);
  await revealVote();

  // A completed tail must not offer a next round or restart a completed issue.
  await selectIssue('First');
  await revealVote();
  await expect(page.getByRole('button', {name: 'Vote next issue', exact: true})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Start new votes', exact: true})).toBeVisible();

  // Reopen Done, then leave before revealing: saved results must not mark it complete.
  await selectIssue('Done');
  await selectIssue('First');
  await revealVote();
  await page.getByRole('button', {name: 'Vote next issue', exact: true}).click();
  await openIssues(page);
  await expect(issue(page, 'Done').getByRole('button', {name: 'Voting now...'})).toBeDisabled();
  await expect(
    issue(page, 'Done').getByRole('button', {name: 'View voting results'}),
  ).toBeVisible();
});

for (const [system, card] of [
  ['Fibonacci', '5'],
  ['Modified Fibonacci', '½'],
  ['Powers of 2', '16'],
]) {
  test(`${system}: create, vote, reveal and reset without issues`, async ({page}) => {
    await page.goto('/');
    await page.getByRole('button', {name: /Voting system/}).click();
    await page.getByRole('menuitem', {name: new RegExp(`^${system} \\(`)}).click();
    await page.getByRole('button', {name: 'Start new game'}).click();
    await join(page, 'Alice');
    await page.getByRole('button', {name: `Vote ${card}`, exact: true}).click();
    await page.getByRole('button', {name: 'Reveal votes', exact: true}).click();
    await expect(page.getByText('Total votes: 1', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Start new votes', exact: true}).click();
    await expect(page.getByText('Pick your cards!', {exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: `Vote ${card}`, exact: true})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
}
