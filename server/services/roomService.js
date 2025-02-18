import { customAlphabet } from "nanoid";
import { createGameRoom } from "../models/GameRoom.js";
import { gameRooms } from "../../server.mjs";
import { sendGameRoomToClient } from "../models/GameRoom.js";
import { users } from "../../server.mjs";
import { gameQuestions } from "../../server.mjs";
import { QUESTION_DURATION } from "../../constans.js";
export const createGameRoomService = (
  playerName,
  category,
  numberOfPlayers,
  socket
) => {
  // first, we check if created roomId already exist.
  let roomId;
  do {
    roomId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 5)();
  } while (gameRooms.get(roomId));

  const gameRoom = createGameRoom(
    socket.id,
    playerName,
    category,
    numberOfPlayers,
    roomId
  );
  gameRooms.set(roomId, gameRoom);
  socket.join(roomId);
  socket.emit("gameRoomCreated", sendGameRoomToClient(gameRoom));
};

export const joinGameRoomService = (playerName, groupId, socket, io) => {
  const gameRoom = gameRooms.get(groupId);
  if (!gameRoom) {
    socket.emit("joinedGroup", {
      status: false,
      message: "Game room does not exist!",
    });
  }
  const socketId = socket.id;
  if (gameRoom && gameRoom.members.length < gameRoom.numberOfPlayers) {
    socket.join(groupId);
    gameRoom.members.push({
      memberId: users.get(socketId),
      socketId,
      playerName,
    });
    gameRoom.scores.push({
      memberId: users.get(socketId),
      points: 0,
      answered: null,
    });
    io.to(groupId).emit("joinedGroup", sendGameRoomToClient(gameRoom));
  }
  if (gameRoom && gameRoom.members.length >= gameRoom.numberOfPlayers) {
    socket.emit("joinedGroup", {
      status: false,
      message: "This room is full!",
    });
  }
};
export const startTimerService = (gameRoomId, io) => {
  const gameRoom = gameRooms.get(gameRoomId);
  const questions = gameQuestions.get(gameRoomId);
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
      gameRoom.questionDuration = QUESTION_DURATION;
      if (gameRoom.currentQuestionIndex < questions.length - 1) {
        io.to(gameRoomId).emit("nextQuestionReady", {
          scores: gameRoom.scores,
          correctAnswer: questions[gameRoom.currentQuestionIndex].correctAnswer,
        });
      } else {
        io.to(gameRoomId).emit("gameEnded", {
          scores: gameRoom.scores,
          correctAnswer: questions[gameRoom.currentQuestionIndex].correctAnswer,
        });
      }
      return;
    }

    io.to(gameRoomId).emit("remainingTime", gameRoom.questionDuration);
  }, 1000);
};
