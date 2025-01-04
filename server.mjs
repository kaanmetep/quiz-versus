import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { sampleQuestions } from "./app/game/questions.js";
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
  const gameRooms = new Map();
  const users = new Map();
  const createGameRoom = (socketId, name, category, maxPlayers, roomId) => {
    const group = {
      id: roomId,
      members: [{ memberId: users.get(socketId), socketId, name }],
      readyPlayers: [],
      category: category,
      maxPlayers: maxPlayers,
      currentQuestionIndex: 0,
      scores: [{ memberId: users.get(socketId), points: 0, answered: null }],
      isGameStarted: false,
    };
    return group;
  };
  const createUser = (socketId) => {
    const uniqueId = uuidv4();
    users.set(socketId, uniqueId);
    return uniqueId;
  };
  io.on("connection", (socket) => {
    const uniqueId = createUser(socket.id); // to create a user with a unique id and we can keep track of the user without using the socket id
    socket.emit("uniqueId", uniqueId); // unique id'yi direkt boyle gonderme de, sorulunca gonder hesabi. ??? look at this later.
    io.emit("newConnection", socket.id);
    socket.on("createGameRoom", (name, category, maxPlayers) => {
      const roomId = nanoid(6);

      const gameRoom = createGameRoom(
        socket.id,
        name,
        category,
        maxPlayers,
        roomId
      );
      gameRooms.set(roomId, gameRoom);
      socket.join(roomId);
      socket.emit("gameRoomCreated", {
        id: gameRoom.id,
        category: gameRoom.category,
        maxPlayers: gameRoom.maxPlayers,
        members: gameRoom.members.map((member) => ({
          name: member.name,
          memberId: member.memberId,
        })),
        readyPlayers: gameRoom.readyPlayers,
        currentQuestionIndex: gameRoom.currentQuestionIndex,
        scores: gameRoom.scores,
      });
    });
    socket.on("joinGroup", (name, groupId) => {
      const gameRoom = gameRooms.get(groupId);
      const socketId = socket.id;
      if (gameRoom && gameRoom.members.length < gameRoom.maxPlayers) {
        socket.join(groupId);
        gameRoom.members.push({ memberId: uniqueId, socketId, name });
        gameRoom.scores.push({
          memberId: uniqueId,
          points: 0,
          answered: null,
        });
        io.to(groupId).emit("joinedGroup", {
          id: gameRoom.id,
          category: gameRoom.category,
          maxPlayers: gameRoom.maxPlayers,
          members: gameRoom.members.map((member) => ({
            name: member.name,
            memberId: member.memberId,
          })),
          readyPlayers: gameRoom.readyPlayers,
          currentQuestionIndex: gameRoom.currentQuestionIndex,
          scores: gameRoom.scores,
        });
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
