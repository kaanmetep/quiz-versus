import { customAlphabet } from "nanoid";
import { createGameRoom } from "../models/GameRoom.js";
import { gameRooms } from "../../server.mjs";
import { sendGameRoomToClient } from "../models/GameRoom.js";
import { users } from "../../server.mjs";
export const createGameRoomService = (name, category, maxPlayers, socket) => {
  const roomId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 5)();
  const gameRoom = createGameRoom(
    socket.id,
    name,
    category,
    maxPlayers,
    roomId
  );
  gameRooms.set(roomId, gameRoom);
  socket.join(roomId);
  socket.emit("gameRoomCreated", sendGameRoomToClient(gameRoom));
};
export const joinGameRoomService = (name, groupId, socket, io) => {
  const gameRoom = gameRooms.get(groupId);
  const socketId = socket.id;
  if (gameRoom && gameRoom.members.length < gameRoom.maxPlayers) {
    socket.join(groupId);
    gameRoom.members.push({ memberId: users.get(socketId), socketId, name });
    gameRoom.scores.push({
      memberId: users.get(socketId),
      points: 0,
      answered: null,
    });
    io.to(groupId).emit("joinedGroup", sendGameRoomToClient(gameRoom));
  }
  if (!gameRoom) {
    socket.emit("joinedGroup", {
      status: false,
      message: "Game room does not exist!",
    });
  }
  if (gameRoom && gameRoom.members.length >= gameRoom.maxPlayers) {
    socket.emit("joinedGroup", {
      status: false,
      message: "This room is full!",
    });
  }
};
