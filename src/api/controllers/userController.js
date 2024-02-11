import { findAllUsers, addUser } from '../models/userModel.js'

export async function getAllUsers(req, res) {
  try {
    const users = await findAllUsers();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(users));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}

export async function addNewUser(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405; // Method Not Allowed
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Method Not Allowed" }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const data = JSON.parse(body);
      const newUser = addUser(data.name);
      res.statusCode = 201; // Created
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(newUser));
    });
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error.message }));
  }
}