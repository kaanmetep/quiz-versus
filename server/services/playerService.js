import { gameRooms } from "../../server.mjs";
import { sampleQuestions } from "../../app/game/questions.js";
import { sendGameRoomToClient } from "../models/GameRoom.js";
export const playerReadyService = (gameRoomId, uniqueId, io) => {
  const userId = uniqueId;
  const gameRoom = gameRooms.get(gameRoomId);
  if (!gameRoom) {
    console.log("Room not found:", gameRoomId);
    return;
  }
  if (!gameRoom.readyPlayers.includes(userId)) {
    gameRoom.readyPlayers.push(userId);
    io.to(gameRoomId).emit("playerIsReady", gameRoom.readyPlayers);
  }
  if (
    gameRoom.readyPlayers.length === gameRoom.members.length &&
    !gameRoom.isGameStarted &&
    gameRoom.maxPlayers === gameRoom.members.length
  ) {
    gameRoom.isGameStarted = true;
    io.to(gameRoomId).emit("gameStarted", true);
  }
};
export const playerAnswerService = (gameRoomId, uniqueId, answer, io) => {
  const gameRoom = gameRooms.get(gameRoomId);
  const userObject = gameRoom.scores.find(
    (score) => score.memberId === uniqueId
  );
  if (userObject.answered !== null) {
    return;
  }
  userObject.answered = answer;
  const currentQuestion = sampleQuestions[gameRoom.currentQuestionIndex];
  if (currentQuestion.correctAnswer === answer) {
    userObject.points = userObject.points + 5;
  }
  if (
    gameRoom.scores.map((score) => score.answered).every(Boolean) &&
    gameRoom.currentQuestionIndex < sampleQuestions.length - 1
  ) {
    io.to(gameRoomId).emit("nextQuestionReady", {
      scores: gameRoom.scores,
    });
  }
  if (
    gameRoom.scores.map((score) => score.answered).every(Boolean) &&
    gameRoom.currentQuestionIndex === sampleQuestions.length - 1
  ) {
    io.to(gameRoomId).emit("gameEnded", {
      scores: gameRoom.scores,
    });
  }
  io.to(gameRoomId).emit("playerAnswered", {
    currentQuestionIndex: gameRoom.currentQuestionIndex,
    scores: gameRoom.scores,
  });
};
export const playAgainService = (gameRoomId, io) => {
  const gameRoom = gameRooms.get(gameRoomId);
  gameRoom.currentQuestionIndex = 0;
  gameRoom.scores.forEach((score) => {
    score.answered = null;
    score.points = 0;
  });
  gameRoom.readyPlayers = [];
  gameRoom.isGameStarted = false;
  io.to(gameRoomId).emit("gameRestarted", sendGameRoomToClient(gameRoom));
};

export const nextQuestionService = (gameRoomId, io) => {
  const gameRoom = gameRooms.get(gameRoomId);
  if (gameRoom.currentQuestionIndex < sampleQuestions.length - 1) {
    gameRoom.currentQuestionIndex++;
    gameRoom.scores.forEach((score) => {
      score.answered = null;
    });
    io.to(gameRoomId).emit("nextQuestion", {
      currentQuestionIndex: gameRoom.currentQuestionIndex,
      scores: gameRoom.scores,
    });
  }
};
