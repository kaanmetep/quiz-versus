"use client";

import { useState } from "react";

const CreateRoom = ({ setOption, socket }) => {
  const [formData, setFormData] = useState({
    name: "",
    players: "2",
    category: "general",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const onCreateGame = () => {
    socket?.emit(
      "createGameRoom",
      formData.name,
      formData.category,
      Number(formData.players)
    );
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    onCreateGame();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 w-full max-w-md mx-4 border border-white/10 shadow-[0_0_30px_rgba(15,_23,_42,_0.3)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-200 tracking-wide">
            Create Room
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
              htmlFor="players"
            >
              Number of Players
            </label>
            <select
              id="players"
              name="players"
              value={formData.players}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            >
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
            </select>
          </div>

          <div>
            <label
              className="block text-slate-300 mb-2 tracking-wide"
              htmlFor="category"
            >
              Quiz Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            >
              <option value="general">General Knowledge</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="movies">Movies & TV</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white rounded-xl py-3 px-4 font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(37,_99,_235,_0.5)] transition-all duration-300 hover:scale-[1.02] border border-blue-400/20"
          >
            Create Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
