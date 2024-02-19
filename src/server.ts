import http from "http";
import dotenv from "dotenv";
import {
  getControllerAllUsers,
  getControllerUser,
  addControllerNewUser,
  updateControllerUser,
  deleteControllerUser,
} from "./api/controllers/userController.ts";

dotenv.config();

const server = http.createServer((req, res) => {
  if (req.url === "/api/users" && req.method === "GET") {
    getControllerAllUsers(req, res);
  } else if (
    req.url &&
    req.url.match(/\/api\/users\/[a-zA-Z0-9-]+/) &&
    req.method === "GET"
  ) {
    const userId = req.url.split("/").pop();
    if (userId !== undefined) {
      getControllerUser(req, res, userId); // Добавляем обработчик для получения пользователя по идентификатору
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.write("Not found userId for get!");
      res.end();
    }
  } else if (req.url === "/api/users" && req.method === "POST") {
    addControllerNewUser(req, res);
  } else if (
    req.url &&
    req.url.match(/\/api\/users\/[a-zA-Z0-9-]+/) &&
    req.method === "PUT"
  ) {
    const userId = req.url.split("/").pop();
    if (userId !== undefined) {
      updateControllerUser(req, res, userId);
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.write("Not found userId for update!");
      res.end();
    }
  } else if (
    req.url &&
    req.url.match(/\/api\/users\/[a-zA-Z0-9-]+/) &&
    req.method === "DELETE"
  ) {
    const userId = req.url.split("/").pop();
    if (userId !== undefined) {
      deleteControllerUser(req, res, userId);
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.write("Not found userId for delete!");
      res.end();
    }
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.write("Not found что то пошло не так!");
    res.end();
  }
});

const PORT = process.env.PORT || 5555;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
