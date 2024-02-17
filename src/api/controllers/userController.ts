import {
  findAllUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../models/userModel.ts";
import { IncomingMessage, ServerResponse } from "http";

export async function getControllerAllUsers(req: IncomingMessage, res: ServerResponse) {
  try {
    const users = await findAllUsers();
    const userId = req.headers["user-id"];
    console.log(`User ID: ${userId}`);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(users));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function addControllerNewUser(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405; // Method Not Allowed
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method Not Allowed" }));
      return;
    }

    let body = "";
    req.on("data", (chunk: string) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const data = JSON.parse(body);
      const newUser = addUser(data.username, data.age, data.hobbies);
      res.statusCode = 201; // Created
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(newUser));
    });
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function updateControllerUser(
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
) {
  try {
    const body = await getRequestBody(req);
    const { username, age, hobbies } = JSON.parse(body);
    const updateUserResult = await updateUser(userId, username, age, hobbies);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(updateUserResult));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function deleteControllerUser(
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
) {
  try {
    const body = await getRequestBody(req); // Получаем тело запроса
    const requestData = JSON.parse(body);
    console.log(`Request data: ${requestData}`);
    const deletedUser = await deleteUser(userId);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(deletedUser));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

function getRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: string) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      resolve(body);
    });
    req.on("error", (error: Error) => {
      reject(error);
    });
  });
}