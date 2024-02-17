import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

let users: User[] = [];

export const findAllUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    const errorCondition = false; 
    if (errorCondition) {
      reject(new Error('Error message'));
    } else {
      resolve(users);
    }
  })
}

export const addUser = (username: string, age: number, hobbies: string[]): User => {
  const newUser = {
    id: uuidv4(),
    username: username,
    age: age,
    hobbies: hobbies,
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (userId: string, username: string, age: number, hobbies: string[]): User | undefined => {
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      id: userId, // Убедитесь, что свойство 'id' присутствует в объекте
      username: username,
      age: age,
      hobbies: hobbies,
    };
    return users[userIndex];
  } else {
    return undefined;
  }
};

export const deleteUser = (userId: string): boolean => {
  const initialLength = users.length;
  users = users.filter((user) => user.id !== userId);
  return users.length < initialLength;
};