import http from "http";
import url from "url";
import dotenv from "dotenv";
dotenv.config();
import { getAllUsers } from "./api/controllers/userController.js";

const server = http.createServer((req, res) => {
  if (req.url === "/api/users" && req.method === "GET") {
    getAllUsers(req, res);
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.write("Not found!");
    res.end();
  }  
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
