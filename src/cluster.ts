import cluster from "cluster";
import * as http from "http";
import { IncomingMessage, ServerResponse } from "http";
import { cpus } from "os";

const BASE_PORT = parseInt(process.env.PORT || "4000", 10);
const numCPUs = cpus().length - 1;
let currentWorker = 0;

const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  // Распределение запросов между воркерами по кругу
  const workerIndex = currentWorker % numCPUs;
  const workerPort = BASE_PORT + 1 + workerIndex;

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

  proxyReq.on("error", (err) => {
    console.error(
      `Прокси-запрос к воркеру на порту ${workerPort} не удался:`,
      err.message
    );
    res.statusCode = 500;
    res.end(`Произошла ошибка: ${err.message}`);
  });

  req.pipe(proxyReq, { end: true });
  currentWorker++;
};

if (cluster.isPrimary) {
  console.log(`Основной процесс запущен. Создаю ${numCPUs} воркеров...`);

  // Создаем воркеры и присваиваем им порты
  for (let i = 0; i < numCPUs; i++) {
    const workerPort = BASE_PORT + 1 + i;
    const env = {
      ...process.env,
      PORT: workerPort.toString(),
      WORKER_ID: i.toString(),
    };
    cluster.fork(env);
    console.log(`Воркер ${i} будет слушать порт ${workerPort}`);
  }

  // Главный сервер (балансировщик нагрузки) слушает базовый порт
  const server = http.createServer(handleRequest);
  server.listen(BASE_PORT, () => {
    console.log(
      `Балансировщик нагрузки запущен на http://localhost:${BASE_PORT}/api`
    );
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Воркер ${worker.process.pid} остановлен (код: ${code}, сигнал: ${signal}). Запускаю новый воркер...`
    );

    // Определяем ID воркера из среды
    const workerId = worker.id ? (worker.id - 1).toString() : "0";
    const workerPort = BASE_PORT + 1 + parseInt(workerId, 10);

    const env = {
      ...process.env,
      PORT: workerPort.toString(),
      WORKER_ID: workerId,
    };
    cluster.fork(env);
  });
} else {
  // Воркеры запускают свой сервер на уникальном порту
  const workerPort = parseInt(
    process.env.PORT || (BASE_PORT + 1).toString(),
    10
  );
  console.log(`Воркер ${process.pid} запускается на порту ${workerPort}`);

  // Импортируем и запускаем сервер (server.ts управляет прослушиванием порта)
  import("./server");
}
