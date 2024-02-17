interface User {
  id: number;
  name: string;
}

const users: User[] = [
  {
    id: 1,
    name: "John Doe",
  },
  {
    id: 2,
    name: "Jane Doe",
  }
]

let nextId = users.length + 1;

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

export const addUser = (name: string): User => {
  const newUser = {
    id: nextId++,
    name: name,
  };
  users.push(newUser);
  return newUser;
};