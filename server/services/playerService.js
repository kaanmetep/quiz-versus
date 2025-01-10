import { gameRooms } from "../../server.mjs";
import { sendGameRoomToClient } from "../models/GameRoom.js";
import { users } from "../../server.mjs";
import { fetchQuestions } from "./questionService.js";
let questions = [];
export const playerReadyService = async (gameRoomId, uniqueId, io) => {
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
    questions = await fetchQuestions(gameRoom.category);
    io.to(gameRoomId).emit(
      "gameStarted",
      questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        category_id: q.category_id,
      }))
    );
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
  const currentQuestion = questions[gameRoom.currentQuestionIndex];
  if (currentQuestion.correctAnswer === answer) {
    userObject.points = userObject.points + 5;
  }

  const allPlayersAnswered = gameRoom.scores.every(
    (score) => score.answered !== null
  );

  if (allPlayersAnswered) {
    if (gameRoom.timer) {
      clearInterval(gameRoom.timer);
    }
    gameRoom.questionDuration = 10;

    if (gameRoom.currentQuestionIndex < questions.length - 1) {
      console.log(gameRoom.currentQuestionIndex);
      console.log(questions[gameRoom.currentQuestionIndex]);
      io.to(gameRoomId).emit("nextQuestionReady", {
        scores: gameRoom.scores,
        correctAnswer: questions[gameRoom.currentQuestionIndex].correctAnswer,
      });
    } else {
      io.to(gameRoomId).emit("gameEnded", {
        scores: gameRoom.scores,
      });
    }
  }

  io.to(gameRoomId).emit("playerAnswered", {
    currentQuestionIndex: gameRoom.currentQuestionIndex,
    scores: gameRoom.scores,
  });
};
export const playAgainService = (gameRoomId, io) => {
  const gameRoom = gameRooms.get(gameRoomId);

  // Clear existing timer if any
  if (gameRoom.timer) {
    clearInterval(gameRoom.timer);
  }

  gameRoom.currentQuestionIndex = 0;
  gameRoom.scores.forEach((score) => {
    score.answered = null;
    score.points = 0;
  });
  gameRoom.readyPlayers = [];
  gameRoom.isGameStarted = false;
  gameRoom.questionDuration = 10;
  io.to(gameRoomId).emit("gameRestarted", sendGameRoomToClient(gameRoom));
};

export const nextQuestionService = (gameRoomId, io) => {
  const gameRoom = gameRooms.get(gameRoomId);
  if (gameRoom.currentQuestionIndex < questions.length - 1) {
    gameRoom.currentQuestionIndex++;
    gameRoom.scores.forEach((score) => {
      score.answered = null;
    });
    gameRoom.questionDuration = 10;
    io.to(gameRoomId).emit("nextQuestion", {
      currentQuestionIndex: gameRoom.currentQuestionIndex,
      scores: gameRoom.scores,
    });
  }
};
// buttonClicked is true when user clicks the leave room button. otherwise it means user disconnected from the socket. (closed the browser)
export const userLeaveService = (buttonClicked = false, socket) => {
  if (!buttonClicked) {
    users.delete(socket.id);
  }
  for (const [groupId, group] of gameRooms.entries()) {
    const memberIndex = group.members.findIndex(
      (member) => member.socketId === socket.id
    );
    if (memberIndex !== -1) {
      const gameRoom = gameRooms.get(groupId);
      const disconnectedMember = group.members[memberIndex];

      // Clear timer when player leaves
      if (gameRoom.timer) {
        clearInterval(gameRoom.timer);
      }

      // Remove member
      group.members.splice(memberIndex, 1);

      // Remove from ready players
      const readyIndex = group.readyPlayers.indexOf(
        disconnectedMember.memberId
      );
      if (readyIndex !== -1) {
        group.readyPlayers.splice(readyIndex, 1);
      }

      // Remove from scores
      const scoreIndex = group.scores.findIndex(
        (score) => score.memberId === disconnectedMember.memberId
      );
      if (scoreIndex !== -1) {
        group.scores.splice(scoreIndex, 1);
      }

      if (gameRoom.isGameStarted) {
        gameRoom.isGameStarted = false;
        gameRoom.scores.forEach((score) => {
          score.points = 0;
          score.answered = null;
        });
        gameRoom.currentQuestionIndex = 0;
        gameRoom.questionDuration = 10;
      }

      // send info to the remaining players. not the ones who left. (broadcasting)
      socket.to(groupId).emit("playerLeft", {
        members: gameRoom.members.map((member) => ({
          name: member.name,
          memberId: member.memberId,
        })),
        readyPlayers: gameRoom.readyPlayers,
        scores: gameRoom.scores,
      });

      if (gameRoom.members.length < 1) {
        gameRooms.delete(groupId);
      }
      break;
    }
  }
};
