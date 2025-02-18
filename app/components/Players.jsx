const Players = ({ gameRoomData, uniqueId, socket }) => {
  const onReadyClick = () => {
    if (gameRoomData.id) {
      socket.emit("playerReady", gameRoomData.id.toString(), uniqueId);
    }
  };
  return (
    <div className="lg:col-span-1">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-slate-200 mb-4 tracking-wide">
          Players
        </h2>
        <div className="space-y-3">
          {gameRoomData?.members?.map(({ playerName, memberId }, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-3 bg-white/5 rounded-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                  {playerName && playerName[0].toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm lg:text-base">
                  {playerName}
                </span>
              </div>

              {memberId === uniqueId &&
                (gameRoomData?.readyPlayers?.includes(memberId) ? (
                  <span className="text-slate-400">Ready ✓</span>
                ) : (
                  <button
                    className="bg-indigo-300 py-1 px-4 rounded-md ml-auto hover:bg-indigo-400 transition-all delay-[50ms]"
                    onClick={() => onReadyClick()}
                  >
                    Ready
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Players;
