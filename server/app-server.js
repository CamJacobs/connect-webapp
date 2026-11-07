// App server node: serves the Connect web app and reports its own health.
// Usage: node server/app-server.js <name> <port>     e.g. node server/app-server.js A 3001
const http = require("http");
const fs = require("fs");
const path = require("path");

const NAME = process.argv[2] || "A";
const PORT = Number(process.argv[3]) || 3001;
const ROOT = path.join(__dirname, "..");
const STARTED = Date.now();
let served = 0;

// Only these file types are served, and never anything inside server/ or hidden folders.
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", "X-Served-By": `Server ${NAME}` });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  // The load balancer pings this to detect whether the node is alive.
  if (url.pathname === "/health") {
    sendJson(res, 200, { name: NAME, port: PORT, status: "up", uptimeSeconds: Math.round((Date.now() - STARTED) / 1000), served });
    return;
  }

  // Lets the demo status page simulate this node failing.
  if (url.pathname === "/__crash") {
    sendJson(res, 200, { name: NAME, status: "crashing" });
    console.log(`[Server ${NAME}] crash requested`);
    setTimeout(() => process.exit(1), 100);
    return;
  }

  let relative = decodeURIComponent(url.pathname);
  if (relative === "/") relative = "/index.html";
  const file = path.normalize(path.join(ROOT, relative));
  const inRoot = file.startsWith(ROOT + path.sep);
  const hidden = relative.split("/").some((part) => part.startsWith(".") || part === "server" || part === "node_modules");
  const type = TYPES[path.extname(file).toLowerCase()];

  if (!inRoot || hidden || !type) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    served++;
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache", "X-Served-By": `Server ${NAME}` });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`[Server ${NAME}] listening on http://localhost:${PORT}`));
