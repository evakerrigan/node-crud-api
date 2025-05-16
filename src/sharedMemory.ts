import { User } from "./api/models/userModel";

let sharedUsers: User[] = [];

export const getSharedUsers = () => sharedUsers;

export const setSharedUsers = (users: User[]) => {
  sharedUsers = users;
};

export const addSharedUser = (user: User) => {
  sharedUsers.push(user);
};

export const updateSharedUser = (userId: string, updatedUser: User) => {
  const index = sharedUsers.findIndex((user) => user.id === userId);
  if (index !== -1) {
    sharedUsers[index] = updatedUser;
  }
};

export const deleteSharedUser = (userId: string) => {
  sharedUsers = sharedUsers.filter((user) => user.id !== userId);
};
