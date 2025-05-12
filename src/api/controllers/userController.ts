import { validateUUID } from "../utils/validateUUID.utils";
import {
  findAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from "../models/userModel.ts";
import { IncomingMessage, ServerResponse } from "http";

export async function getControllerAllUsers(res: ServerResponse) {
  try {
    const users = await findAllUsers();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(users));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function getControllerUser(
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
) {
  if (!userId || !validateUUID(userId)) {
    res.writeHead(400);
    res.end("Invalid UUID");
    return;
  }

  try {
    const user = await getUserById(userId);
    if (user) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(user));
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.write("User not found");
      res.end();
    }
    console.log(req.url);
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function addControllerNewUser(
  req: IncomingMessage,
  res: ServerResponse
) {
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
      try {
        const data = JSON.parse(body);

        if (
          !data.username ||
          typeof data.username !== "string" ||
          data.username.trim() === ""
        ) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid username" }));
          return;
        }

        if (typeof data.age !== "number" || data.age <= 0) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid age" }));
          return;
        }

        if (
          !Array.isArray(data.hobbies) ||
          data.hobbies.some(
            (hobby: any) => typeof hobby !== "string" || hobby.trim() === ""
          )
        ) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid hobbies" }));
          return;
        }

        const newUser = addUser(data.username, data.age, data.hobbies);
        res.statusCode = 201; // Created
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(newUser));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Invalid request body" }));
      }
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
  if (!userId || !validateUUID(userId)) {
    res.writeHead(400);
    res.end("Invalid UUID");
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { username, age, hobbies } = JSON.parse(body);

    if (!username || typeof username !== "string" || username.trim() === "") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Invalid username" }));
      return;
    }

    if (typeof age !== "number" || age <= 0) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Invalid age" }));
      return;
    }

    if (
      !Array.isArray(hobbies) ||
      hobbies.some(
        (hobby: any) => typeof hobby !== "string" || hobby.trim() === ""
      )
    ) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Invalid hobbies" }));
      return;
    }

    const updateUserResult = await updateUser(userId, username, age, hobbies);

    if (updateUserResult) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updateUserResult));
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "User not found" }));
    }
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function deleteControllerUser(
  req: IncomingMessage,
  res: ServerResponse
) {
  const userId = req.url?.split("/").pop();

  if (!userId || !validateUUID(userId)) {
    res.writeHead(400);
    res.end("Invalid UUID");
    return;
  }

  try {
    await deleteUser(userId);
    res.statusCode = 204;
    res.end();
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
