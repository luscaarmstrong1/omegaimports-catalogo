import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const viewports = [
  { name: 'homepage-1920-approved.png', w: 1920, h: 1080 },
  { name: 'homepage-1672-approved.png', w: 1672, h: 1080 },
  { name: 'homepage-1440-approved.png', w: 1440, h: 900 },
  { name: 'homepage-1024-approved.png', w: 1024, h: 768 },
  { name: 'homepage-768-approved.png', w: 768, h: 1024 },
  { name: 'homepage-430-approved.png', w: 430, h: 932 },
  { name: 'homepage-390-approved.png', w: 390, h: 844 },
  { name: 'homepage-375-approved.png', w: 375, h: 667 }
];

const sections = [
  { name: 'header-approved.png', selector: '.site-header', w: 1920 },
  { name: 'hero-approved.png', selector: '.hero-section', w: 1920 },
  { name: 'categories-approved.png', selector: '#categorias', w: 1920 },
  { name: 'products-approved.png', selector: '#produtos', w: 1920 },
  { name: 'blog-approved.png', selector: '#blog', w: 1920 },
  { name: 'brands-approved.png', selector: '#marcas', w: 1920 },
  { name: 'support-approved.png', selector: '.support-section', w: 1920 },
  { name: 'footer-approved.png', selector: '.site-footer', w: 1920 }
];

const outDir = path.resolve('handoff/omegaimports-v2-approved/03-screenshots');

async function captureAll() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.resolve('.chrome-temp-capture-approved');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9258',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + userData
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const list = await fetch('http://127.0.0.1:9258/json/list').then(r => r.json());
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise((res, rej) => {
      const cur = id++;
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === cur) { ws.removeEventListener('message', h); res(m.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });
    await new Promise(r => ws.onopen = r);

    // Full-page viewport captures
    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w < 768
      });

      await send('Page.navigate', { url: 'http://localhost:4180/preview-v2/' });
      await new Promise(r => setTimeout(r, 1200));

      // Reveal all elements and scroll to trigger lazy loading
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
          document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.loading = 'eager';
          });
        `
      });
      await new Promise(r => setTimeout(r, 500));

      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });

      fs.writeFileSync(path.join(outDir, vp.name), Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved fullpage: ${vp.name}`);
    }

    // Individual Section captures at 1920px
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:4180/preview-v2/' });
    await new Promise(r => setTimeout(r, 1000));
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
      `
    });
    await new Promise(r => setTimeout(r, 500));

    for (const sec of sections) {
      const boxRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.querySelector('${sec.selector}');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height };
          })()
        `,
        returnByValue: true
      });

      const box = boxRes.result.value;
      if (box) {
        const screenshot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: box.x,
            y: box.y,
            width: box.w,
            height: box.h,
            scale: 1
          },
          captureBeyondViewport: true
        });
        fs.writeFileSync(path.join(outDir, sec.name), Buffer.from(screenshot.data, 'base64'));
        console.log(`Saved section: ${sec.name}`);
      } else {
        console.warn(`Could not find selector: ${sec.selector}`);
      }
    }

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
    try { fs.rmSync(userData, { recursive: true, force: true }); } catch (e) {}
  }
}

captureAll();
