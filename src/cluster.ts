import cluster from "cluster";
import * as http from "http";
import { IncomingMessage, ServerResponse } from "http";
import { cpus } from "os";
import {
  getSharedUsers,
  setSharedUsers,
  addSharedUser,
  updateSharedUser,
  deleteSharedUser,
} from "./sharedMemory";

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
    const worker = cluster.fork(env);
    console.log(`Воркер ${i} будет слушать порт ${workerPort}`);

    // Обработка сообщений от воркеров
    worker.on("message", (message) => {
      switch (message.type) {
        case "GET_USERS":
          worker.send({ type: "USERS_DATA", users: getSharedUsers() });
          break;
        case "SET_USERS":
          setSharedUsers(message.users);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
        case "ADD_USER":
          addSharedUser(message.user);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
        case "UPDATE_USER":
          updateSharedUser(message.userId, message.user);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
        case "DELETE_USER":
          deleteSharedUser(message.userId);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
      }
    });
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
    const newWorker = cluster.fork(env);

    // Добавляем обработчик сообщений для нового воркера
    newWorker.on("message", (message) => {
      switch (message.type) {
        case "GET_USERS":
          newWorker.send({ type: "USERS_DATA", users: getSharedUsers() });
          break;
        case "SET_USERS":
          setSharedUsers(message.users);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
        case "ADD_USER":
          addSharedUser(message.user);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
        case "UPDATE_USER":
          updateSharedUser(message.userId, message.user);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
        case "DELETE_USER":
          deleteSharedUser(message.userId);
          // Оповещаем все воркеры об обновлении
          for (const id in cluster.workers) {
            cluster.workers[id]?.send({
              type: "USERS_UPDATED",
              users: getSharedUsers(),
            });
          }
          break;
      }
    });
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
