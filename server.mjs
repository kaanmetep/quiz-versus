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
    console.log("a user connected", socket.id);
    const uniqueId = createUser(socket.id); // to create a user with a unique id and we can keep track of the user without using the socket id
    socket.emit("uniqueId", uniqueId); // TODO: send unique id to the client only when its asked from the client side! (it might cause some bugs otherwise.. or it might not)

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

    socket.on("leaveRoom", () => userLeaveService(true, socket)); // TODO: Maybe we should take gameRoomId from the client side. but either way its going to work because we have the socket id and we'll loop from GameRooms.

    socket.on("disconnect", () => userLeaveService(false, socket));
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
