import { spawn } from 'child_process';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9241',
  '--window-size=1920,1080'
]);

setTimeout(async () => {
  try {
    const vRes = await fetch('http://127.0.0.1:9241/json/version');
    const vData = await vRes.json();
    const ws = new WebSocket(vData.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const cur = id++;
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === cur) {
            ws.removeEventListener('message', h);
            if (m.error) rej(m.error);
            else res(m.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method, params }));
      });
    }

    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:4180/preview-v2/' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    function sendSession(method, params = {}) {
      return new Promise((res, rej) => {
        const cur = id++;
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === cur) {
            ws.removeEventListener('message', h);
            if (m.error) rej(m.error);
            else res(m.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, sessionId, method, params }));
      });
    }

    await new Promise(r => setTimeout(r, 2000));

    const check = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const m = document.querySelector('.desktop-master-layout');
        const s = document.querySelector('.semantic-layout');
        return {
          windowWidth: window.innerWidth,
          masterDisplay: window.getComputedStyle(m).display,
          semanticDisplay: window.getComputedStyle(s).display,
          masterHeight: m.getBoundingClientRect().height,
          semanticHeight: s.getBoundingClientRect().height
        };
      })()`,
      returnByValue: true
    });

    console.log('Displays check:', JSON.stringify(check.result.value, null, 2));
    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}, 1500);
