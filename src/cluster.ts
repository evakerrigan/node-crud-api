import cluster from "cluster";
import * as http from "http";
import { IncomingMessage, ServerResponse } from "http";
import { cpus } from "os";

const PORT = parseInt(process.env.PORT || "4000", 10);
const numCPUs = cpus().length - 1;
let currentWorker = 0;

const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  const workerPort = PORT + 1 + (currentWorker % numCPUs);
  const proxyReq = http.request(
    {
      hostname: "localhost",
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  req.pipe(proxyReq, { end: true });
  currentWorker++;
};

if (cluster.isPrimary) {
  console.log(`Master process is running. Spawning ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`Load balancer is running on http://localhost:${PORT}/api`);
  });

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Spawning a new worker...`);
    cluster.fork();
  });
} else {
  import("./server");
}
