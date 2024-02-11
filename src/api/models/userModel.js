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

export const findAllUsers = () => {
  return new Promise((resolve, reject) => {
    // if (errorCondition) {
    //   reject(new Error('Error message'));
    // } else {
      resolve(users);
    // }
  })
}