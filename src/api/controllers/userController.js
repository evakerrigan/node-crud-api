const { findAllUsers } = require("../models/userModel");

export async function getAllUsers(req, res) {
  try {
    const users = await findAllUsers();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json(users);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
