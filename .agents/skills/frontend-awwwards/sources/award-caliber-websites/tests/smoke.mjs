#!/usr/bin/env node
// Runtime smoke test for a fixture: the build compiling is not proof the engine works. Loads the
// home page, waits for the loader, checks the GL canvas, clicks into a project through the page
// transition, goes back, and requests a missing page. Fails on any console or page error.
// Run from the fixture folder (Playwright resolves from there) against a running server:
//   cd tests/nexttest && node ../smoke.mjs http://127.0.0.1:4400
import { launch } from '../awwwards/scripts/browser.mjs';

const base = (process.argv[2] || 'http://127.0.0.1:4400').replace(/\/$/, '');
const errors = [];
let missing = false; // during the 404 step the document's own 404 is expected
const fail = (msg) => { errors.push(msg); throw new Error(msg); };

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => {
  if (m.type() !== 'error' || (missing && /status of 404/.test(m.text()))) return;
  errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('requestfailed', (r) => {
  // Navigating away aborts in-flight prefetches; that is not a bug.
  if (!/ERR_ABORTED/.test(r.failure()?.errorText || '')) errors.push(`request failed: ${r.url()} ${r.failure()?.errorText}`);
});

const curtainDown = () => page.waitForFunction(() => {
  const c = document.getElementById('curtain');
  if (!c) return true;
  const cs = getComputedStyle(c);
  return cs.visibility === 'hidden' || +cs.opacity === 0;
}, null, { timeout: 10_000 }).catch(() => fail('curtain still covers the page 10 s after navigation'));

const step = async (name, fn) => {
  try { await fn(); console.log(`ok   ${name}`); }
  catch (e) { if (!errors.includes(e.message)) errors.push(`${name}: ${e.message}`); console.log(`FAIL ${name}`); }
};

await step('home loads and the loader finishes', async () => {
  const res = await page.goto(base + '/');
  if (!res?.ok()) fail(`home returned ${res?.status()}`);
  await page.waitForSelector('html.is-loaded', { state: 'attached', timeout: 20_000 }).catch(() => fail('html.is-loaded never set: loader stuck'));
  const hidden = await page.evaluate(() => {
    const l = document.getElementById('loader');
    if (!l || l.hidden) return true;
    const cs = getComputedStyle(l);
    return cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0;
  });
  if (!hidden) fail('loader still visible after is-loaded');
});

await step('GL canvas mounts', async () => {
  await page.waitForSelector('.gl-canvas', { state: 'attached', timeout: 5_000 }).catch(() => fail('no .gl-canvas: WebGL planes did not mount'));
});

let target = '';
await step('page transition into a project', async () => {
  const link = page.locator('main a[href*="/work/"]').first();
  target = await link.getAttribute('href') || fail('no /work/ link on the home page');
  const before = await page.title();
  await link.click();
  await page.waitForURL((u) => u.pathname.startsWith(new URL(target, base).pathname), { timeout: 10_000 });
  await curtainDown();
  await page.waitForFunction((t) => document.title !== t && !!document.querySelector('main h1'), before, { timeout: 5_000 })
    .catch(() => fail('project page did not render (title unchanged or no h1)'));
});

await step('back button returns home', async () => {
  await page.goBack();
  await page.waitForURL((u) => u.pathname === '/', { timeout: 10_000 });
  await curtainDown();
  if (!(await page.locator('main a[href*="/work/"]').count())) fail('home content missing after back');
});

await step('missing page returns 404', async () => {
  missing = true;
  const res = await page.goto(`${base}/__smoke-missing-${Date.now()}/`);
  if (res?.status() !== 404) fail(`missing page returned ${res?.status()}`);
  await page.waitForSelector('html.is-loaded', { state: 'attached', timeout: 20_000 }).catch(() => fail('404 page: loader stuck'));
  missing = false;
});

await browser.close();

if (errors.length) {
  console.log('\n' + errors.map((e) => `  ${e}`).join('\n'));
  process.exit(1);
}
console.log('\nok: smoke test passed');
