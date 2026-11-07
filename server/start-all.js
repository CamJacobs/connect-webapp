// Starts the whole cluster (two app servers + the load balancer) as separate processes and
// restarts any node that exits. Usage: node server/start-all.js
const { spawn } = require("child_process");
const path = require("path");

const RESTART_DELAY_MS = 8000;
const nodes = [
  { label: "Server A", file: "app-server.js", args: ["A", "3001"] },
  { label: "Server B", file: "app-server.js", args: ["B", "3002"] },
  { label: "Load balancer", file: "load-balancer.js", args: ["3000"] },
];

let stopping = false;
const children = [];

function start(node) {
  const child = spawn(process.execPath, [path.join(__dirname, node.file), ...node.args], { stdio: "inherit" });
  children.push(child);
  child.on("exit", (code) => {
    children.splice(children.indexOf(child), 1);
    if (stopping) return;
    console.log(`[Supervisor] ${node.label} stopped (code ${code}); restarting in ${RESTART_DELAY_MS / 1000}s`);
    setTimeout(() => !stopping && start(node), RESTART_DELAY_MS);
  });
}

nodes.forEach(start);

console.log("\nConnect cluster starting.\n  App:    http://localhost:3000\n  Status: http://localhost:3000/__status\n  Press Ctrl+C to stop everything.\n");

function stop() {
  stopping = true;
  children.forEach((child) => child.kill());
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
