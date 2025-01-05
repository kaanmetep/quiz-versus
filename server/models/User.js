import { v4 as uuidv4 } from "uuid";
import { users } from "../../server.mjs";
export const createUser = (socketId) => {
  const uniqueId = uuidv4();
  users.set(socketId, uniqueId);
  return uniqueId;
};
