import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

export async function captureViewport(url, width, height, outputPath, clipSelector = null) {
  const tempProfile = path.resolve('./.chrome-temp-' + Math.random().toString(36).substring(2));
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--window-size=${width},${height}`,
    `--user-data-dir=${tempProfile}`
  ]);

  await sleep(1500);

  try {
    const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const versionData = await targetsRes.json();
    const ws = new WebSocket(versionData.webSocketDebuggerUrl);

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    const { targetId } = await sendCDP(ws, 'Target.createTarget', { url: 'about:blank' }, msgId++);
    const { sessionId } = await sendCDP(ws, 'Target.attachToTarget', { targetId, flatten: true }, msgId++);

    async function sendSessionCDP(method, params = {}) {
      const curId = msgId++;
      return new Promise((resolve, reject) => {
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, sessionId, method, params }));
      });
    }

    await sendSessionCDP('Page.enable');
    await sendSessionCDP('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Disable CSS animations & transitions to ensure pixel-perfect stability
    await sendSessionCDP('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        const style = document.createElement('style');
        style.textContent = '* { animation: none !important; transition: none !important; }';
        document.head.appendChild(style);
      `
    });

    await sendSessionCDP('Page.navigate', { url });
    await sleep(2000);

    // Wait for fonts
    await sendSessionCDP('Runtime.evaluate', {
      expression: 'document.fonts.ready'
    });

    let clip = null;
    if (clipSelector) {
      const elBox = await sendSessionCDP('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('${clipSelector}');
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
        })()`,
        returnByValue: true
      });
      if (elBox.result && elBox.result.value) {
        clip = {
          ...elBox.result.value,
          scale: 1
        };
      }
    }

    const screenshot = await sendSessionCDP('Page.captureScreenshot', {
      format: 'png',
      clip: clip || { x: 0, y: 0, width, height, scale: 1 },
      captureBeyondViewport: false
    });

    const buffer = Buffer.from(screenshot.data, 'base64');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    console.log(`Captured ${outputPath} (${width}x${height})`);

    ws.close();
  } finally {
    chrome.kill();
    await sleep(600);
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {}
  }
}

// Standalone execution if called directly
if (process.argv[1] && process.argv[1].endsWith('capture-section.mjs')) {
  const [,, section, out] = process.argv;
  const selectors = {
    hero: '#hero-composite',
    categories: '#categories-composite',
    products: '#products-composite',
    content: '#content-composite',
    footer: '#footer-composite'
  };
  const targetSelector = selectors[section] || null;
  captureViewport('http://localhost:4180/', 1672, 941, out || `preview-v2/_visual-tests/${section}/current.png`, targetSelector)
    .catch(console.error);
}
