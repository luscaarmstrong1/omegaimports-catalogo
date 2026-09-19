import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function getWS(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const currentId = msgId++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === currentId) {
        ws.removeEventListener('message', handler);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: currentId, method, params }));
  });
  return { ws, send };
}

async function captureElementOrFull(url, outputFile, width, height, selector = null, fullPage = false) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.resolve(`.chrome-temp-app-${Date.now()}`);
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${userData}`
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9229/json/list', res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
    });

    const page = list.find(p => p.type === 'page') || list[0];
    const { ws, send } = getWS(page.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);

    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768
    });

    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 1500));

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
      `
    });
    await new Promise(r => setTimeout(r, 400));

    let clip = null;
    if (selector) {
      const evalBox = await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('${selector}');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height, scale: 1 };
        })()`,
        returnByValue: true
      });
      if (evalBox.result.value) {
        clip = evalBox.result.value;
        clip.width = Math.ceil(clip.width);
        clip.height = Math.ceil(clip.height);
        clip.x = Math.floor(clip.x);
        clip.y = Math.floor(clip.y);
      }
    }

    const shotParams = { format: 'png' };
    if (clip) {
      shotParams.clip = clip;
      shotParams.captureBeyondViewport = true;
    } else if (fullPage) {
      shotParams.captureBeyondViewport = true;
      const scrollHeightRes = await send('Runtime.evaluate', {
        expression: 'document.documentElement.scrollHeight',
        returnByValue: true
      });
      const totalH = scrollHeightRes.result.value || height;
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: totalH,
        deviceScaleFactor: 1,
        mobile: width < 768
      });
    }

    const result = await send('Page.captureScreenshot', shotParams);
    fs.writeFileSync(outputFile, Buffer.from(result.data, 'base64'));
    console.log(`Saved screenshot: ${path.basename(outputFile)}`);

    ws.close();
  } finally {
    chrome.kill();
    try { fs.rmSync(userData, { recursive: true, force: true }); } catch (e) {}
  }
}

const outDir = path.resolve('handoff/omegaimports-v2-approved/03-screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const targetUrl = 'http://localhost:4180/preview-v2/';

async function run() {
  // Viewports
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

  for (const vp of viewports) {
    await captureElementOrFull(targetUrl, path.join(outDir, vp.name), vp.w, vp.h, null, true);
  }

  // Sections (at 1920px)
  const sections = [
    { name: 'header-approved.png', selector: '.site-header' },
    { name: 'hero-approved.png', selector: '.hero-section' },
    { name: 'categories-approved.png', selector: '#categorias' },
    { name: 'products-approved.png', selector: '#produtos' },
    { name: 'blog-approved.png', selector: '#blog' },
    { name: 'brands-approved.png', selector: '#marcas' },
    { name: 'support-approved.png', selector: '.support-section' },
    { name: 'footer-approved.png', selector: '.site-footer' }
  ];

  for (const sec of sections) {
    await captureElementOrFull(targetUrl, path.join(outDir, sec.name), 1920, 1080, sec.selector, false);
  }

  console.log('ALL APPROVED SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch(console.error);
