"use client";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";

import Play from "./Play";
const Page = () => {
  const [socket, setSocket] = useState(null);
  const [option, setOption] = useState(null);
  const [gameRoomData, setGameRoomData] = useState(null);
  const [error, setError] = useState("");
  const [uniqueId, setUniqueId] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
    });
    newSocket.on("uniqueId", (id) => {
      setUniqueId(id);
    });
    newSocket.on("connect", () => {
      console.log("Connection is successfull!");
    });
    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket.");
    });
    newSocket.on("connect_error", () => {
      console.log("There is a connection error.");
    });
    newSocket.on("newConnection", (data) => {});
    newSocket.on("gameRoomCreated", (data) => {
      setGameRoomData(data);
    });
    newSocket.on("joinedGroup", (data) => {
      if (data.status !== undefined) {
        return setError(data.message);
      }
      setGameRoomData(data);
    });
    newSocket.on("playerLeft", (data) => {
      setGameRoomData((prev) => ({
        ...prev,
        members: data.members,
        readyPlayers: data.readyPlayers,
        scores: data.scores,
      }));
    });
    newSocket.on("playerIsReady", (data) => {
      setGameRoomData((prev) => ({
        ...prev,
        readyPlayers: data,
      }));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <div>
      {gameRoomData ? (
        <Play
          gameRoomData={gameRoomData}
          socket={socket}
          uniqueId={uniqueId}
          setGameRoomData={setGameRoomData}
          setOption={setOption}
        />
      ) : (
        <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-800/70 via-slate-900 to-slate-800/70 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Subtle background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3B82F640,transparent)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_70%_80%,#8B5CF640,transparent)]"></div>

          <div className="w-full max-w-4xl relative z-10">
            <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 mb-2 drop-shadow-lg tracking-wider font-orbitron">
              Quiz Versus
            </h1>
            <p className="text-center text-slate-400 mb-12 text-lg tracking-wide">
              Challenge your friends in real-time quiz battles!
            </p>

            <div className="backdrop-blur-sm bg-white/5 rounded-3xl shadow-[0_0_30px_rgba(15,_23,_42,_0.3)] p-8 border border-white/10">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-slate-300 mb-4 tracking-wide">
                    Ready to Play?
                  </h2>
                  <p className="text-slate-400 mb-6 tracking-wide">
                    Create a new game room or join an existing one
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(37,_99,_235,_0.7)] border border-blue-400/40 shadow-[0_0_20px_rgba(37,_99,_235,_0.3)]"
                    onClick={() => setOption("create")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <h3 className="text-xl font-bold mb-2 tracking-wider">
                        Create Room
                      </h3>
                      <p className="text-sm text-blue-100 tracking-wide">
                        Start a new quiz battle
                      </p>
                    </div>
                  </button>

                  <button
                    className="group relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700 text-white rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,_92,_246,_0.7)] border border-violet-400/40 shadow-[0_0_20px_rgba(139,_92,_246,_0.3)]"
                    onClick={() => setOption("join")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center">
                      <h3 className="text-xl font-bold mb-2 tracking-wider">
                        Join Room
                      </h3>
                      <p className="text-sm text-violet-100 tracking-wide">
                        Enter an existing game
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-8 text-center text-sm text-slate-500 tracking-wide">
                  <p>Connect with friends and test your knowledge!</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto mt-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex justify-between items-center">
                <p className="text-slate-400 font-inter">
                  Made for fun by{" "}
                  <a
                    href="https://github.com/kaanmetep"
                    className="text-indigo-500 hover:text-indigo-400 transition-colors border-b border-indigo-500"
                    target="_blank"
                  >
                    me
                  </a>
                </p>
                <p className="text-slate-400 font-inter">v1.0.0</p>
              </div>
            </footer>
          </div>

          {option === "create" && (
            <CreateRoom setOption={setOption} socket={socket} />
          )}
          {option === "join" && (
            <JoinRoom
              setOption={setOption}
              socket={socket}
              setGameRoomData={setGameRoomData}
              error={error}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
