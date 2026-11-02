import { expect, test } from '@playwright/test';

const shot = (name: string) => ({ path: `e2e/screenshots/${name}.png` });

test('create project, count, remind, add counter, persist, offline', async ({ page, context }) => {
  await page.goto('/');
  await page.screenshot(shot('01-empty'));

  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByRole('textbox', { name: 'New project' }).fill('Cosy sweater');
  await page.screenshot(shot('02-new-sheet'));
  await page.getByRole('button', { name: 'Start', exact: true }).click();

  const counter = page.getByRole('button', { name: /^Rows: \d+/ });
  await expect(counter).toBeVisible();
  for (let i = 0; i < 5; i++) await counter.click({ position: { x: 150, y: 200 } });
  await expect(counter).toHaveAttribute('aria-label', /Rows: 5\./);

  // reminder in 2
  await counter.getByRole('button', { name: 'Reminder' }).click();
  await page.getByRole('button', { name: 'Fewer' }).click();
  await page.getByRole('button', { name: 'Fewer' }).click();
  await page.getByRole('textbox', { name: 'Reminder text' }).fill('Decrease');
  await page.screenshot(shot('03-reminder-sheet'));
  await page.getByRole('button', { name: 'Set reminder' }).click();
  await page.waitForTimeout(500);
  await page.screenshot(shot('04-reminder-chip'));

  await counter.click({ position: { x: 150, y: 200 } });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await counter.click({ position: { x: 150, y: 200 } });
  await expect(page.getByRole('alert')).toContainText('Decrease');
  await page.waitForTimeout(900);
  await page.screenshot(shot('05-toast'));
  // tapping the dimmed page acknowledges the reminder without counting
  await page.mouse.click(200, 600);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(counter).toHaveAttribute('aria-label', /Rows: 7\./);

  // the "Got it" button also works
  await counter.getByRole('button', { name: 'Reminder' }).click(); // stepper remembers 2
  await page.getByRole('textbox', { name: 'Reminder text' }).fill('Check gauge');
  await page.getByRole('button', { name: 'Set reminder' }).click();
  await page.waitForTimeout(500);
  await counter.click({ position: { x: 150, y: 200 } });
  await counter.click({ position: { x: 150, y: 200 } });
  await expect(page.getByRole('alert')).toContainText('Check gauge');
  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Subtract one' }).first().click();
  await page.getByRole('button', { name: 'Subtract one' }).first().click();
  await expect(counter).toHaveAttribute('aria-label', /Rows: 7\./);

  // second counter
  await page.getByRole('button', { name: 'Counter', exact: true }).click();
  await page.getByRole('textbox', { name: 'Counter label' }).fill('Repeats');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  await page.screenshot(shot('06-two-counters'));

  // third counter — all three still fit without scrolling
  await page.getByRole('button', { name: 'Counter', exact: true }).click();
  await page.getByRole('textbox', { name: 'Counter label' }).fill('Cables');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  await page.screenshot(shot('06b-three-counters'));
  const fits = await page.evaluate(() => {
    const s = document.querySelector('.layer.project .screen') as HTMLElement;
    return s.scrollHeight <= s.clientHeight + 1;
  });
  expect(fits).toBe(true);
  await page.getByRole('button', { name: /^Cables: 0\./ }).getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await page.waitForTimeout(600);

  // recent reminder pill
  await counter.getByRole('button', { name: 'Reminder' }).click();
  const recent = page.getByRole('button', { name: 'Decrease, in 2 rows' });
  await expect(recent).toBeVisible();
  await expect(recent).toContainText('2');
  const sheet = page.getByRole('dialog', { name: 'Reminder' });
  for (let i = 0; i < 3; i++) await sheet.getByRole('button', { name: 'More', exact: true }).click();
  await expect(sheet.getByRole('spinbutton', { name: 'Count' })).not.toHaveValue('2');
  await recent.click();
  await expect(sheet.getByRole('spinbutton', { name: 'Count' })).toHaveValue('2');
  await expect(page.getByRole('textbox', { name: 'Reminder text' })).toHaveValue('Decrease');
  await expect(recent).toHaveClass(/selected/);
  await page.screenshot(shot('08-recent-reminders'));
  await page.keyboard.press('Escape');

  // persisted after reload
  await page.reload();
  await expect(page.getByRole('button', { name: /^Rows: 7\./ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Repeats: 0\./ })).toBeVisible();

  // set an exact count from the menu
  await page.getByRole('button', { name: /^Rows: 7\./ }).getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Set count' }).click();
  const setSheet = page.getByRole('dialog', { name: 'Set count' });
  await expect(setSheet.getByRole('spinbutton', { name: 'Count' })).toHaveValue('7');
  await setSheet.getByRole('spinbutton', { name: 'Count' }).fill('1234');
  await page.screenshot(shot('09-set-count'));
  await setSheet.getByRole('button', { name: 'Set to 1234' }).click();
  await expect(page.getByRole('button', { name: /^Rows: 1234\./ })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  // back home
  await page.getByRole('button', { name: 'Back to projects' }).click();
  await page.waitForTimeout(600);
  await expect(page.getByText('Cosy sweater')).toBeVisible();
  await page.screenshot(shot('07-home-list'));

  // offline after SW is ready
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Cosy sweater')).toBeVisible();
});

test('dark mode screenshot', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.screenshot(shot('08-dark-empty'));
  await ctx.close();
});
