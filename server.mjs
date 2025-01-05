import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import {
  createGameRoomService,
  joinGameRoomService,
} from "./server/services/roomService.js";
import { sampleQuestions } from "./app/game/questions.js";
import { createUser } from "./server/models/User.js";

export const gameRooms = new Map();
export const users = new Map();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const uniqueId = createUser(socket.id); // to create a user with a unique id and we can keep track of the user without using the socket id

    socket.emit("uniqueId", uniqueId); // TODO: send unique id to the client only when its asked from the client side! (it might cause some bugs..)

    socket.on("createGameRoom", (name, category, maxPlayers) => {
      createGameRoomService(name, category, maxPlayers, socket);
    });
    socket.on("joinGroup", (name, groupId) => {
      joinGameRoomService(name, groupId, socket, io);
    });
    socket.on("playerReady", (gameRoomId, uniqueId) => {
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
    });
    socket.on("playerAnswer", (gameRoomId, uniqueId, answer) => {
      const gameRoom = gameRooms.get(gameRoomId);
      const userId = gameRoom.scores.find(
        (score) => score.memberId === uniqueId
      );
      if (userId.answered !== null) {
        return;
      }
      const currentQuestion = sampleQuestions[gameRoom.currentQuestionIndex];
      userId.answered = answer;
      if (currentQuestion.correctAnswer === answer) {
        userId.points = userId.points + 5;
      }
      if (
        gameRoom.scores.map((score) => score.answered).every(Boolean) &&
        gameRoom.currentQuestionIndex < sampleQuestions.length - 1
      ) {
        io.to(gameRoomId).emit("nextQuestionReady", {
          scores: gameRoom.scores,
        });
      }
      io.to(gameRoomId).emit("playerAnswered", {
        currentQuestionIndex: gameRoom.currentQuestionIndex,
        scores: gameRoom.scores,
      });
    });
    socket.on("nextQuestion", (gameRoomId) => {
      const gameRoom = gameRooms.get(gameRoomId);
      gameRoom.currentQuestionIndex++;
      gameRoom.scores.forEach((score) => {
        score.answered = null;
      });
      io.to(gameRoomId).emit("nextQuestion", {
        currentQuestionIndex: gameRoom.currentQuestionIndex,
        scores: gameRoom.scores,
      });
    });
    socket.on("disconnect", () => {
      users.delete(socket.id);
      for (const [groupId, group] of gameRooms.entries()) {
        const memberIndex = group.members.findIndex(
          (member) => member.socketId === socket.id
        );
        if (memberIndex !== -1) {
          const gameRoom = gameRooms.get(groupId);
          const disconnectedMember = group.members[memberIndex];

          // Remove member
          group.members.splice(memberIndex, 1);

          // Remove from ready players if they were ready
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
          }
          // Update game room
          gameRooms.set(groupId, {
            ...group,
            members: [...group.members],
            readyPlayers: [...group.readyPlayers],
            scores: [...group.scores],
          });

          // Send updated state to all members
          io.to(groupId).emit("playerLeft", {
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
    });
  });
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
