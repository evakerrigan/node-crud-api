import { findAllUsers, addUser } from '../models/userModel.ts';
import { IncomingMessage, ServerResponse } from 'http';

export async function getAllUsers(req: IncomingMessage, res: ServerResponse) {
  try {
    const users = await findAllUsers();
    const userId = req.headers['user-id'];
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

export async function addNewUser(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405; // Method Not Allowed
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method Not Allowed" }));
      return;
    }

    let body = '';
    req.on('data', (chunk: string) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const data = JSON.parse(body);
      const newUser = addUser(data.name);
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