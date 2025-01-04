"use client";
import { useState, useEffect } from "react";

const JoinRoom = ({ setOption, socket, error }) => {
  const [formData, setFormData] = useState({
    name: "",
    roomCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!socket) return;
    socket.emit("joinGroup", formData.name, formData.roomCode);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 w-full max-w-md mx-4 border border-white/10 shadow-[0_0_30px_rgba(15,_23,_42,_0.3)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-200 tracking-wide">
            Join Room
          </h2>
          <button
            onClick={() => setOption(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-slate-300 mb-2 tracking-wide"
              htmlFor="name"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              className="block text-slate-300 mb-2 tracking-wide"
              htmlFor="roomCode"
            >
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              name="roomCode"
              value={formData.roomCode}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
              placeholder="Enter room code"
            />
          </div>
          {error && (
            <p className="text-center text-red-600 font-semibold text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 via-violet-600 to-indigo-700 text-white rounded-xl py-3 px-4 font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(139,_92,_246,_0.5)] transition-all duration-300 hover:scale-[1.02] border border-violet-400/20"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
