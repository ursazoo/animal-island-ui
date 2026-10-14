import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const output = process.env.ANIMAL_QA_OUTPUT ?? '../../outputs/taro-first-batch';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
});
const results = [];
const errors = [];
try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://127.0.0.1:4173');
    await page.getByText('Nunito + Noto Sans SC · 原库字体已加载').waitFor();
    for (const width of [320, 375, 414]) {
        await page.setViewportSize({ width, height: 812 });
        await page.screenshot({ path: `${output}/preview-${width}.png` });
        const overflow = await page.evaluate(() => document.querySelector('.preview-page').scrollWidth > innerWidth);
        assert.equal(overflow, false, `horizontal overflow at ${width}`);
        const alignment = await page
            .locator('input')
            .first()
            .evaluate((input) => {
                const outer = input.parentElement.parentElement.getBoundingClientRect(),
                    inner = input.getBoundingClientRect();
                const select = document.querySelector('[aria-label="选择小岛"]').getBoundingClientRect();
                return {
                    textCenterDelta: Math.abs(inner.y + inner.height / 2 - outer.y - outer.height / 2),
                    fieldLeftDelta: Math.abs(select.x - outer.x),
                    fieldRightDelta: Math.abs(select.right - outer.right),
                };
            });
        assert.ok(
            Object.values(alignment).every((delta) => delta < 1),
            `form alignment at ${width}: ${JSON.stringify(alignment)}`
        );
        const grid = await page.locator('.button-grid').evaluate((el) =>
            Array.from(el.children)
                .slice(0, 2)
                .map((child) => child.getBoundingClientRect().toJSON())
        );
        assert.ok(
            Math.abs(grid[0].width - grid[1].width) < 1 && Math.abs(grid[0].y - grid[1].y) < 1,
            `button grid alignment at ${width}`
        );
        results.push(
            `Width ${width}: no horizontal overflow; text centered, form edges and button grid aligned within 1px`
        );
    }
    for (const width of [320, 375, 414]) {
        await page.setViewportSize({ width, height: 812 });
        await page.getByRole('button', { name: '选择小岛', exact: true }).click();
        const sheet = page.getByRole('dialog', { name: '选择你的小岛' });
        await page.waitForTimeout(400);
        assert.doesNotMatch(await sheet.textContent(), /上一项|下一项|确认后才会保存选择|滚动停止后可确认/);
        const metrics = await sheet.evaluate((el) => {
            const buttons = [...el.querySelectorAll('[role="button"]')];
            const cancel = buttons.find((b) => b.textContent.trim() === '取消');
            const confirm = buttons.find((b) => b.textContent.trim() === '确定');
            const footer = cancel.parentElement;
            const a = cancel.getBoundingClientRect(),
                b = confirm.getBoundingClientRect();
            const f = footer.getBoundingClientRect(),
                css = getComputedStyle(footer);
            const close = el.querySelector('[aria-label="关闭"]');
            const icon = close.querySelector('taro-image-core');
            return {
                widthDelta: Math.abs(a.width - b.width),
                heightDelta: Math.abs(a.height - b.height),
                cancelShadow: getComputedStyle(cancel).boxShadow,
                confirmShadow: getComputedStyle(confirm).boxShadow,
                cancelTransform: getComputedStyle(cancel).transform,
                confirmTransform: getComputedStyle(confirm).transform,
                topDelta: Math.abs(a.y - b.y),
                leftDelta: Math.abs(a.left - f.left - parseFloat(css.paddingLeft)),
                rightDelta: Math.abs(b.right - f.right + parseFloat(css.paddingRight)),
                closeSize: close.getBoundingClientRect().width,
                iconSize: icon.getBoundingClientRect().width,
                wheelBackground: getComputedStyle(el.querySelector('taro-picker-view-core')).backgroundColor,
                panelBackground: getComputedStyle(el).backgroundColor,
            };
        });
        for (const key of ['widthDelta', 'heightDelta', 'topDelta', 'leftDelta', 'rightDelta'])
            assert.ok(metrics[key] < 1, `${width} ${key}: ${metrics[key]}`);
        assert.ok(metrics.closeSize >= 44 && metrics.iconSize >= 32, JSON.stringify(metrics));
        assert.equal(metrics.wheelBackground, 'rgb(248, 248, 240)');
        assert.notEqual(metrics.wheelBackground, metrics.panelBackground);
        assert.equal(metrics.cancelShadow, metrics.confirmShadow, 'paired visible shadows');
        assert.equal(metrics.cancelTransform, metrics.confirmTransform, 'paired vertical transforms');
        await page.screenshot({ path: `${output}/picker-${width}.png` });
        await sheet.getByRole('button', { name: '关闭', exact: true }).click();
        await page.waitForTimeout(400);
        results.push(
            `Width ${width}: equal full-row actions, aligned bodies and shadows, 32px close graphic/44px target, warm-white wheel separated from cream drawer, no redundant controls or hints`
        );
    }
    await page.setViewportSize({ width: 375, height: 812 });
    const trigger = page.getByRole('button', { name: '选择小岛', exact: true });
    await trigger.click();
    let dialog = page.getByRole('dialog', { name: '选择你的小岛' });
    await dialog.waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${output}/picker-375.png` });
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.taro_page')).overflow), 'hidden');
    await dialog.getByRole('button', { name: '确定', exact: true }).click();
    await page.waitForTimeout(400);
    assert.match(await trigger.textContent(), /森间岛/);
    results.push('Untouched wheel: confirm selects displayed first option');
    await trigger.click();
    // Let the entrance animation and initial focus handoff finish before keyboard input.
    await page.waitForTimeout(400);
    await dialog.getByRole('spinbutton').focus();
    await page.keyboard.press('ArrowDown');
    await dialog.getByRole('button', { name: '取消' }).click();
    await page.waitForTimeout(400);
    assert.match(await trigger.textContent(), /森间岛/);
    results.push('Cancel discards draft');
    await trigger.click();
    // Let the entrance animation and initial focus handoff finish before keyboard input.
    await page.waitForTimeout(400);
    await dialog.getByRole('spinbutton').focus();
    await page.keyboard.press('ArrowDown');
    await dialog.getByRole('button', { name: '确定', exact: true }).click();
    await page.waitForTimeout(400);
    assert.match(await trigger.textContent(), /海风岛/);
    results.push('Focused wheel ArrowDown: confirm commits current option');
    await trigger.click();
    await page.waitForTimeout(400);
    const wheel = page.locator('taro-picker-view-core');
    const wheelRect = await wheel.boundingBox();
    const cdp = await page.context().newCDPSession(page);
    const point = { x: wheelRect.x + wheelRect.width / 2, y: wheelRect.y + wheelRect.height / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    assert.equal(await dialog.getByRole('button', { name: '确定', exact: true }).getAttribute('aria-disabled'), 'true');
    for (let step = 1; step <= 6; step++) {
        await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: point.x, y: point.y - step * 10 }],
        });
        await page.waitForTimeout(80);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(1200);
    assert.equal(
        await dialog.getByRole('button', { name: '确定', exact: true }).getAttribute('aria-disabled'),
        'false'
    );
    assert.equal(await wheel.evaluate((element) => element.value[0]), 2);
    await page.screenshot({ path: `${output}/touch-picker.png` });
    await dialog.getByRole('button', { name: '确定', exact: true }).click();
    await page.waitForTimeout(400);
    await cdp.detach();
    assert.match(await trigger.textContent(), /月光岛/);
    results.push(
        'Real touch swipe changes the wheel, disables confirm while moving, and confirmation commits the displayed key'
    );

    for (const width of [320, 375, 414]) {
        await page.setViewportSize({ width, height: 812 });
        await trigger.click();
        await page.waitForTimeout(400);
        const picker = page.getByRole('spinbutton');
        const rect = await picker.boundingBox();
        await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
        for (const deltaY of [72, 19, 240, -53, -700, 47]) {
            await page.mouse.wheel(0, deltaY);
            await page.waitForTimeout(850);
            const state = await picker.evaluate((el) => {
                const bar = el.querySelector('.taro-picker-view-mask-indicator').getBoundingClientRect();
                const column = el.querySelector('taro-picker-view-column-core');
                const rows = [...column.children].map((row) => {
                    const r = row.getBoundingClientRect();
                    return { label: row.textContent, delta: Math.abs(r.top + r.height / 2 - bar.top - bar.height / 2) };
                });
                const nearest = rows.reduce((a, b) => (a.delta < b.delta ? a : b));
                return { nearest, label: el.getAttribute('aria-valuetext'), value: el.getAttribute('aria-valuenow') };
            });
            assert.ok(state.nearest.delta < 1, `wheel stuck between rows at ${width}: ${JSON.stringify(state)}`);
            assert.equal(state.nearest.label, state.label);
            assert.equal(
                await dialog.getByRole('button', { name: '确定', exact: true }).getAttribute('aria-disabled'),
                'false'
            );
        }
        await page.screenshot({ path: `${output}/wheel-settled-${width}.png` });
        await dialog.getByRole('button', { name: '取消', exact: true }).click();
        await page.waitForTimeout(400);
        assert.match(await trigger.textContent(), /月光岛/);
        results.push(
            `Width ${width}: wheel/trackpad-size deltas, fast/reverse scrolling and boundaries snap within 1px; visible option matches selection; cancel preserves committed value`
        );
    }
    for (const [width, height] of [
        [320, 568],
        [375, 812],
        [414, 896],
    ]) {
        await page.setViewportSize({ width, height });
        await page.getByRole('button', { name: '选择邻居', exact: true }).click();
        const searchSheet = page.getByRole('dialog', { name: '寻找邻居' });
        await page.waitForTimeout(400);
        for (const name of ['小秋 · 面包师', '阿米 · 森林向导', '桃桃 · 园艺师', '小秋 · 面包师']) {
            const row = searchSheet.getByRole('button', { name, exact: true });
            await row.scrollIntoViewIfNeeded();
            await row.evaluate((el) => {
                window.__rowFrames = [];
                const start = performance.now();
                const sample = () => {
                    const label = el.querySelector('taro-view-core');
                    const icon = el.querySelector('taro-image-core');
                    const l = label.getBoundingClientRect(),
                        i = icon.getBoundingClientRect();
                    window.__rowFrames.push({
                        x: l.x,
                        y: l.y,
                        iconX: i.x,
                        labelRight: l.right,
                        defaultFlash: el.classList.contains('button-hover'),
                    });
                    if (performance.now() - start < 500) requestAnimationFrame(sample);
                };
                sample();
            });
            await row.tap();
            await page.waitForTimeout(550);
            const frames = await page.evaluate(() => window.__rowFrames);
            assert.ok(frames.length > 5);
            assert.ok(
                frames.every(
                    (f) =>
                        Math.abs(f.x - frames[0].x) < 1 &&
                        Math.abs(f.y - frames[0].y) < 1 &&
                        f.iconX > f.labelRight &&
                        !f.defaultFlash
                ),
                `search row moves or flashes: ${JSON.stringify(frames)}`
            );
        }
        const searchInput = searchSheet.locator('input');
        const assertFocusFits = async () => {
            const bounds = await searchInput.evaluate((input) => {
                const wrapper = input.closest('taro-input-core').parentElement;
                const scroll = wrapper.closest('taro-scroll-view-core');
                const w = wrapper.getBoundingClientRect(),
                    s = scroll.getBoundingClientRect();
                const css = getComputedStyle(wrapper);
                const ring = parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset);
                return {
                    focused: document.activeElement === input,
                    top: w.top - ring - s.top,
                    left: w.left - ring - s.left,
                    right: s.right - w.right - ring,
                    bottom: s.bottom - w.bottom - ring,
                };
            });
            assert.ok(
                bounds.focused && [bounds.top, bounds.left, bounds.right, bounds.bottom].every((v) => v >= 0),
                `clipped search focus ring: ${JSON.stringify(bounds)}`
            );
        };
        await searchInput.focus();
        await page.waitForTimeout(250);
        await assertFocusFits();
        await searchInput.fill('桃');
        await page.waitForTimeout(250);
        await assertFocusFits();
        await searchInput.fill('');
        await page.waitForTimeout(250);
        await searchInput.scrollIntoViewIfNeeded();
        await assertFocusFits();
        await page.screenshot({ path: `${output}/search-focus-${width}.png` });
        const searchHeight = (await searchSheet.boundingBox()).height;
        assert.ok(searchHeight >= height * 0.4 - 1 && searchHeight <= height * 0.75 + 1);
        await page.screenshot({ path: `${output}/search-stable-${width}.png` });
        await searchSheet.getByRole('button', { name: '关闭', exact: true }).click();
        await page.waitForTimeout(400);
        await page.getByRole('button', { name: '打开底部抽屉', exact: true }).click();
        const longSheet = page.getByRole('dialog', { name: '登岛前的小贴士' });
        await page.waitForTimeout(400);
        const footer = await longSheet.evaluate((el) => {
            const panel = el.getBoundingClientRect(),
                bar = el.lastElementChild;
            const b = bar.getBoundingClientRect(),
                button = bar.firstElementChild.getBoundingClientRect();
            const style = getComputedStyle(bar);
            const body = el.querySelector('taro-scroll-view-core').getBoundingClientRect();
            return {
                height: panel.height,
                gap: button.top - b.top,
                shadow: style.boxShadow,
                background: style.backgroundColor,
                overlap: body.bottom - b.top,
                bottom: button.bottom,
            };
        });
        assert.ok(Math.abs(footer.height - height * 0.75) < 1, `long drawer cap: ${JSON.stringify(footer)}`);
        assert.ok(footer.gap >= 16 && footer.overlap < 1 && footer.bottom < height);
        assert.notEqual(footer.shadow, 'none');
        assert.equal(footer.background, 'rgb(247, 243, 223)');
        await longSheet.getByText('小岛日常 08', { exact: true }).scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/drawer-footer-${width}.png` });
        await longSheet.getByRole('button', { name: '再打开一层抽屉', exact: true }).click();
        await page.waitForTimeout(400);
        const shortSheet = page.getByRole('dialog', { name: '这是第二层' });
        assert.ok(Math.abs((await shortSheet.boundingBox()).height - height * 0.4) < 1, 'short drawer minimum');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        results.push(
            `${width}x${height}: repeated touch selection stays left-aligned across animation frames; search focus ring remains fully inside the scroll boundary before/after filtering; short/long drawers meet 40%/75% bounds; footer has 16px top spacing, opaque background and upward shadow`
        );
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: '选择邻居', exact: true }).click();
    dialog = page.getByRole('dialog', { name: '寻找邻居' });
    assert.equal(await page.locator('input:focus').count(), 0, 'search must not auto-open keyboard');
    await dialog.locator('input').fill('桃');
    await dialog.getByRole('button', { name: '桃桃 · 园艺师', exact: true }).click();
    await page.screenshot({ path: `${output}/search-375.png` });
    await dialog.getByRole('button', { name: '确定', exact: true }).click();
    await page.waitForTimeout(400);
    assert.match(await page.getByRole('button', { name: '选择邻居', exact: true }).textContent(), /桃桃/);
    results.push('Search filters and confirms');
    await page.getByRole('button', { name: '保存我的名片', exact: true }).click();
    assert.match(await page.locator('.feedback').first().textContent(), /欢迎来到月光岛/);
    results.push('Composed form saves actual component state');
    await page.getByRole('button', { name: '打开底部抽屉', exact: true }).click();
    const singleWidthDelta = await page.getByRole('dialog', { name: '登岛前的小贴士' }).evaluate((el) => {
        const footer = el.lastElementChild,
            button = footer.firstElementChild;
        const css = getComputedStyle(footer);
        return Math.abs(
            button.getBoundingClientRect().width -
                footer.getBoundingClientRect().width +
                parseFloat(css.paddingLeft) +
                parseFloat(css.paddingRight)
        );
    });
    assert.ok(singleWidthDelta < 1, `single action fills footer: ${singleWidthDelta}`);
    const singleShadow = await page
        .getByRole('dialog', { name: '登岛前的小贴士' })
        .evaluate((el) => getComputedStyle(el.lastElementChild.firstElementChild).boxShadow);
    assert.match(singleShadow, /0px 5px 0px/, 'single action retains thick shadow');
    results.push('Single Drawer action fills the available footer width and retains its original 5px shadow');
    await page.getByRole('button', { name: '再打开一层抽屉', exact: true }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${output}/nested-drawer-375.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    assert.equal(await page.getByRole('dialog', { name: '这是第二层' }).count(), 0);
    assert.equal(await page.getByRole('dialog', { name: '登岛前的小贴士' }).count(), 1);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    results.push('Nested Escape closes only top layer and restores scrolling after final close');
    await page.getByRole('button', { name: '空选项测试', exact: true }).click();
    dialog = page.getByRole('dialog', { name: '暂无小岛' });
    assert.equal(await dialog.getByRole('button', { name: '确定', exact: true }).getAttribute('aria-disabled'), 'true');
    await page.screenshot({ path: `${output}/empty-375.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    results.push('Empty options cannot confirm');
    const disabled = page.getByRole('button', { name: '禁用选择', exact: true });
    await disabled.dispatchEvent('click');
    assert.equal(await page.getByRole('dialog').count(), 0);
    results.push('Disabled Select cannot open');
    const clickButton = page.getByRole('button', { name: '点我试试', exact: true });
    await clickButton.focus();
    await page.keyboard.press('Enter');
    assert.match(await page.getByText(/有效点击：/).textContent(), /1 次/);
    results.push('Button keyboard activation');
    assert.deepEqual(errors, [], 'runtime errors');
    writeFileSync(
        `${output}/browser-results.json`,
        JSON.stringify(
            { engine: 'Google Chrome (Moli navigation timeout; explicit fallback)', results, errors },
            null,
            2
        )
    );
    console.log(results.join('\n'));
} finally {
    await browser.close();
}
