import { customAlphabet } from "nanoid";
import { createGameRoom } from "../models/GameRoom.js";
import { gameRooms } from "../../server.mjs";
import { sendGameRoomToClient } from "../models/GameRoom.js";
import { users } from "../../server.mjs";
import { sampleQuestions } from "../../app/game/questions.js";
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
export const startTimerService = (gameRoomId, io) => {
  const gameRoom = gameRooms.get(gameRoomId);

  // Clear any existing timer first
  if (gameRoom.timer) {
    clearInterval(gameRoom.timer);
  }

  // Emit initial time immediately
  io.to(gameRoomId).emit("remainingTime", gameRoom.questionDuration);

  gameRoom.timer = setInterval(() => {
    gameRoom.questionDuration -= 1;

    if (gameRoom.questionDuration < 0) {
      clearInterval(gameRoom.timer);
      gameRoom.questionDuration = 10;
      if (gameRoom.currentQuestionIndex < sampleQuestions.length - 1) {
        io.to(gameRoomId).emit("nextQuestionReady", {
          scores: gameRoom.scores,
        });
      } else {
        io.to(gameRoomId).emit("gameEnded", {
          scores: gameRoom.scores,
        });
      }
      return;
    }

    io.to(gameRoomId).emit("remainingTime", gameRoom.questionDuration);
  }, 1000);
};
