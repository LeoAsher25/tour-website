const list = await fetch("http://localhost:9223/json").then(r => r.json());
const page = list.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve) => {
    const i = ++id;
    pending.set(i, resolve);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
};
await new Promise(r => ws.onopen = r);
const expr = `(() => {
  const d = document.documentElement;
  const header = document.querySelector('header');
  const btn = header?.querySelector('a[href="/#booking"] span');
  const burger = header?.querySelector('button[aria-label="Open menu"]');
  const r = (el) => el ? { left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right, width: el.getBoundingClientRect().width } : null;
  return JSON.stringify({
    vw: innerWidth,
    scrollW: d.scrollWidth,
    bodyScrollW: document.body.scrollWidth,
    header: r(header),
    btn: r(btn),
    burger: r(burger),
    headerChildren: [...header.querySelectorAll(':scope > div > *')].map(el => ({ tag: el.tagName, right: el.getBoundingClientRect().right, left: el.getBoundingClientRect().left })),
  });
})()`;
const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log(res.result.value);
ws.close();
process.exit(0);
