import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

interface WorkerMessage {
  type: "USERS_DATA" | "USERS_UPDATED";
  users: User[];
}

let users: User[] = [];

// Инициализация данных при запуске воркера
if (process.send) {
  // Режим кластера
  process.send({ type: "GET_USERS" });
  process.on("message", (message: WorkerMessage) => {
    if (message.type === "USERS_DATA" || message.type === "USERS_UPDATED") {
      users = message.users;
    }
  });
}

export const findAllUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    try {
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

export const getUserById = (userId: string) => {
  return users.find((user) => user.id === userId);
};

export const addUser = (
  username: string,
  age: number,
  hobbies: string[]
): User => {
  const newUser = {
    id: uuidv4(),
    username: username,
    age: age,
    hobbies: hobbies,
  };
  if (process.send) {
    // Режим кластера
    process.send({ type: "ADD_USER", user: newUser });
  } else {
    // Режим без кластера
    users.push(newUser);
  }
  return newUser;
};

export const updateUser = (
  userId: string,
  username: string,
  age: number,
  hobbies: string[]
): User | undefined => {
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    const updatedUser = {
      ...users[userIndex],
      id: userId,
      username: username,
      age: age,
      hobbies: hobbies,
    };
    if (process.send) {
      // Режим кластера
      process.send({ type: "UPDATE_USER", userId, user: updatedUser });
    } else {
      // Режим без кластера
      users[userIndex] = updatedUser;
    }
    return updatedUser;
  }
  return undefined;
};

export const deleteUser = (userId: string): boolean => {
  const initialLength = users.length;
  if (process.send) {
    // Режим кластера
    process.send({ type: "DELETE_USER", userId });
  } else {
    // Режим без кластера
    users = users.filter((user) => user.id !== userId);
  }
  return initialLength > users.length;
};
