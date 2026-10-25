const { test, expect } = require('@playwright/test');
const { watchErrors } = require('./helpers');

const seg = (page, name, value) => page.click(`[data-seg="${name}"] button[data-v="${value}"]`);

test('DR explorer picks the cheapest strategy that meets RTO and RPO', async ({ page }) => {
  const check = watchErrors(page);
  await page.goto('/#/tools/dr');
  const cases = [[10, 10, 'Backup & restore'], [5, 3, 'Pilot light'], [3, 1, 'Warm standby'], [0, 0, 'Multi-site active/active']];
  for (const [rto, rpo, expected] of cases) {
    await page.locator('#rto').fill(String(rto));
    await page.locator('#rpo').fill(String(rpo));
    await expect(page.locator('#drOut h3')).toHaveText(expected);
  }
  check();
});

test('DR slider can be dragged end to end in one motion', async ({ page }) => {
  await page.goto('/#/tools/dr');
  const box = await page.locator('#rto').boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 2, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(page.locator('#rtoLbl')).toHaveText('Near zero');
});

test('S3 picker recommends a class for every path', async ({ page }) => {
  await page.goto('/#/tools/s3');
  const res = page.locator('.result-box h3');
  await seg(page, 'pattern', 'frequent'); await expect(res).toHaveText('S3 Standard');
  await seg(page, 'pattern', 'unknown'); await expect(res).toHaveText('S3 Intelligent-Tiering');
  await seg(page, 'pattern', 'infrequent'); await expect(res).toHaveText('S3 Standard-IA');
  await seg(page, 'az', 'single'); await expect(res).toHaveText('S3 One Zone-IA');
  await seg(page, 'pattern', 'archive'); await expect(res).toHaveText('S3 Glacier Instant Retrieval');
  await seg(page, 'speed', 'minutes'); await expect(res).toHaveText('S3 Glacier Flexible Retrieval');
  await seg(page, 'speed', 'hours'); await expect(res).toHaveText('S3 Glacier Deep Archive');
});

test('subnet calculator handles valid, misaligned and invalid CIDRs', async ({ page }) => {
  await page.goto('/#/tools/cidr');
  const out = page.locator('#cidrOut');
  await page.locator('#pre').fill('24');
  await expect(out).toContainText('256 addresses each');
  await expect(out).toContainText('251');
  await page.locator('#cidr').fill('192.168.1.0/24');
  await page.locator('#pre').fill('26');
  await expect(out).toContainText('59');
  await page.locator('#cidr').fill('10.0.5.0/16');
  await expect(out).toContainText("isn't on a /16 boundary");
  await page.locator('#cidr').fill('10.0.0.0/8');
  await expect(out).toContainText('between /16');
  await page.locator('#cidr').fill('nonsense');
  await expect(out).toContainText('Enter an IPv4 CIDR');
});

test('database chooser reaches a recommendation on every branch', async ({ page }) => {
  await page.goto('/#/tools/db');
  const top = await page.locator('[data-o]').count();
  let leaves = 0;
  for (let i = 0; i < top; i++) {
    await page.locator('[data-o]').nth(i).click();
    if (await page.locator('.result-box').count()) { leaves++; }
    else {
      const sub = await page.locator('[data-o]').count();
      for (let j = 0; j < sub; j++) {
        await page.locator('[data-o]').nth(j).click();
        await expect(page.locator('.result-box h3')).not.toBeEmpty();
        leaves++;
        await page.click('[data-back="1"]');
      }
    }
    await page.click('[data-back="0"]');
  }
  expect(leaves).toBeGreaterThan(10);
});

test('EC2 advisor recommends by workload', async ({ page }) => {
  await page.goto('/#/tools/ec2');
  const first = page.locator('.stack h3').first();
  await expect(first).toHaveText('Compute Savings Plans');
  await seg(page, 'flex', 'no'); await expect(first).toHaveText(/Instance Savings Plans/);
  await seg(page, 'interrupt', 'yes'); await expect(first).toHaveText('Spot Instances');
  await seg(page, 'interrupt', 'no'); await seg(page, 'usage', 'spiky'); await expect(first).toHaveText('On-Demand');
  await seg(page, 'dedicated', 'yes'); await expect(first).toHaveText('Dedicated Hosts');
});

test('security group vs NACL simulator walks the packet', async ({ page }) => {
  await page.goto('/#/tools/sgnacl');
  const verdict = page.locator('.result-box h3');
  await expect(verdict).toHaveText('Connection fails');
  await expect(page.locator('.stack .explain').last()).toContainText('stateless');
  await page.check('[data-c="out"]');
  await expect(verdict).toHaveText('Connection succeeds');
  await seg(page, 'src', 'bad');
  await expect(verdict).toHaveText('Connection fails');
  await expect(page.locator('.stack .explain').first()).toContainText('Rule 90');
});

test('data transfer calculator compares online vs Snowball', async ({ page }) => {
  await page.goto('/#/tools/transfer');
  const out = page.locator('#xferOut');
  await page.locator('#tb').fill('10.8');
  await page.locator('#util').fill('100');
  await expect(out).toContainText('10.80 TB/day');
  await expect(out).toContainText('Use the network');
  await page.locator('#tb').fill('500');
  await page.locator('#mbps').fill('100');
  await expect(out).toContainText('Ship it with Snowball Edge');
  await page.locator('#mbps').fill('');
  await expect(out).toContainText('Enter a positive number');
});

test('Route 53 game scores a full round', async ({ page }) => {
  await page.goto('/#/tools/r53');
  for (let i = 0; i < 10; i++) {
    await page.click('[data-p="simple"]');
    await page.click('#next');
  }
  await expect(page.locator('main h2').first()).toHaveText(/\/ 10/);
  await page.click('#again');
  await expect(page.locator('.q-stem')).toBeVisible();
});
