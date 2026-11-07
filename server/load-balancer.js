// Load balancer node: the single address users connect to. It spreads requests across the app
// servers (round-robin), detects failed servers with health checks, and routes around them.
// Usage: node server/load-balancer.js [port]
const http = require("http");

const PORT = Number(process.argv[2]) || 3000;
const CHECK_INTERVAL_MS = 2000;
const CHECK_TIMEOUT_MS = 1000;

const nodes = [
  { name: "A", port: 3001, up: false, requests: 0, lastCheck: null },
  { name: "B", port: 3002, up: false, requests: 0, lastCheck: null },
];

const events = [];
function log(message) {
  const line = `${new Date().toLocaleTimeString()}  ${message}`;
  console.log(`[Balancer] ${line}`);
  events.unshift(line);
  if (events.length > 15) events.pop();
}

function setUp(node, up) {
  node.lastCheck = new Date().toLocaleTimeString();
  if (node.up === up) return;
  node.up = up;
  log(up ? `Server ${node.name} is UP` : `Server ${node.name} is DOWN - traffic goes to the other server`);
}

// Failure detector: ping every node's /health on a timer.
function checkNode(node) {
  const req = http.get({ host: "127.0.0.1", port: node.port, path: "/health", timeout: CHECK_TIMEOUT_MS }, (res) => {
    res.resume();
    setUp(node, res.statusCode === 200);
  });
  req.on("timeout", () => req.destroy());
  req.on("error", () => setUp(node, false));
}

setInterval(() => nodes.forEach(checkNode), CHECK_INTERVAL_MS);
nodes.forEach(checkNode);

let next = 0;
function pickNodes() {
  // Healthy nodes in round-robin order, starting after the one used last.
  const ordered = nodes.map((_, i) => nodes[(next + i) % nodes.length]);
  next = (next + 1) % nodes.length;
  return ordered.filter((node) => node.up);
}

function forward(req, res, candidates) {
  const node = candidates.shift();
  if (!node) {
    res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Connect is unavailable: no app servers are running.");
    return;
  }

  const upstream = http.request(
    { host: "127.0.0.1", port: node.port, path: req.url, method: req.method, headers: req.headers },
    (reply) => {
      node.requests++;
      res.writeHead(reply.statusCode, { ...reply.headers, "X-Balancer": "Connect LB" });
      reply.pipe(res);
    },
  );
  upstream.on("error", () => {
    // The node died between health checks: mark it down and retry on the next healthy node.
    setUp(node, false);
    forward(req, res, candidates);
  });
  req.pipe(upstream);
}

function statusPage() {
  const rows = nodes
    .map(
      (n) => `<tr><td>Server ${n.name}</td><td>:${n.port}</td>
        <td class="${n.up ? "up" : "down"}">${n.up ? "UP" : "DOWN"}</td><td>${n.requests}</td><td>${n.lastCheck || "-"}</td>
        <td><button onclick="fetch('/__crash/${n.name}').then(()=>setTimeout(()=>location.reload(),600))" ${n.up ? "" : "disabled"}>Crash</button></td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="2">
<title>Connect Status</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0a0710;color:#f5f5f7;max-width:760px;margin:2rem auto;padding:0 1rem}
  table{width:100%;border-collapse:collapse;margin:1rem 0}
  th,td{text-align:left;padding:.5rem;border-bottom:1px solid #333}
  .up{color:#3ba55c;font-weight:700}.down{color:#ed4245;font-weight:700}
  button{padding:.3rem .8rem;cursor:pointer}pre{background:#111;padding:1rem;border-radius:6px;overflow:auto}
</style></head><body>
<h1>Connect cluster status</h1>
<p>Load balancer on :${PORT} - refreshes every 2 seconds. Crash a server to watch failover; the supervisor restarts it after 8 seconds.</p>
<table><tr><th>Node</th><th>Port</th><th>State</th><th>Requests</th><th>Last check</th><th></th></tr>${rows}</table>
<h2>Event log</h2><pre>${events.join("\n") || "No events yet."}</pre>
<p><a href="/" style="color:#9d7bff">Open Connect</a></p>
</body></html>`;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/__status") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(statusPage());
      return;
    }

    const crash = url.pathname.match(/^\/__crash\/([AB])$/);
    if (crash) {
      const node = nodes.find((n) => n.name === crash[1]);
      log(`Crash requested for Server ${node.name}`);
      http.get({ host: "127.0.0.1", port: node.port, path: "/__crash" }, (r) => r.resume()).on("error", () => {});
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    forward(req, res, pickNodes());
  })
  .listen(PORT, () => log(`Load balancer listening on http://localhost:${PORT}  (status page: /__status)`));
