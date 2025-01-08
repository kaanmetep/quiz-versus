import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import {
  createGameRoomService,
  joinGameRoomService,
  startTimerService,
} from "./server/services/roomService.js";
import {
  playerReadyService,
  playerAnswerService,
  playAgainService,
  nextQuestionService,
  userLeaveService,
} from "./server/services/playerService.js";
import { createUser } from "./server/models/User.js";

export const gameRooms = new Map();
export const users = new Map();
const connectionCounts = new Map();
const LIMITS = {
  MAX_CONNECTIONS_PER_IP: 5,
  CONNECTION_TIMEOUT: 1000 * 60 * 60, // 1 saat
};

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const hostname = dev ? "localhost" : undefined;

const app = next({
  dev,
  ...(dev ? { hostname, port } : {}),
});
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const ip =
      socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
    const currentCount = connectionCounts.get(ip) || 0;

    if (currentCount >= LIMITS.MAX_CONNECTIONS_PER_IP) {
      return next(new Error("Too many connections from this IP"));
    }

    connectionCounts.set(ip, currentCount + 1);

    socket.on("disconnect", () => {
      const newCount = connectionCounts.get(ip) - 1;
      if (newCount <= 0) {
        connectionCounts.delete(ip);
      } else {
        connectionCounts.set(ip, newCount);
      }
    });

    next();
  });

  io.on("connection", (socket) => {
    const uniqueId = createUser(socket.id);
    socket.emit("uniqueId", uniqueId);

    socket.on("createGameRoom", (name, category, maxPlayers) => {
      createGameRoomService(name, category, maxPlayers, socket);
    });
    socket.on("joinGroup", (name, groupId) => {
      joinGameRoomService(name, groupId, socket, io);
    });
    socket.on("playerReady", (gameRoomId, uniqueId) => {
      playerReadyService(gameRoomId, uniqueId, io);
    });
    socket.on("playerAnswer", (gameRoomId, uniqueId, answer) =>
      playerAnswerService(gameRoomId, uniqueId, answer, io)
    );
    socket.on("playAgain", (gameRoomId) => {
      playAgainService(gameRoomId, io);
    });
    socket.on("nextQuestion", (gameRoomId) =>
      nextQuestionService(gameRoomId, io)
    );
    socket.on("startTimer", (gameRoomId) => startTimerService(gameRoomId, io));
    socket.on("leaveRoom", () => userLeaveService(true, socket));
    socket.on("disconnect", () => userLeaveService(false, socket));
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Server running on port: ${port} in ${process.env.NODE_ENV} mode`
      );
    });
});
