const users = [
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

export const findAllUsers = () => {
  return new Promise((resolve, reject) => {
    // if (errorCondition) {
    //   reject(new Error('Error message'));
    // } else {
      resolve(users);
    // }
  })
}

export const addUser = (name) => {
  const newUser = {
    id: nextId++,
    name: name,
  };
  users.push(newUser);
  return newUser;
};