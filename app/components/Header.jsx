const Header = ({ gameRoomData }) => {
  return (
    <div className="max-w-7xl mx-auto mb-8">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 tracking-wider font-orbitron">
            Quiz Room: {gameRoomData.id}
          </h1>
          <p className="text-slate-400 mt-1 font-inter">
            Category: {gameRoomData.category}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col gap-2">
          <p className="text-slate-300 text-sm font-inter">
            Players: {gameRoomData.members.length}/{gameRoomData.maxPlayers}
          </p>
          <p className="text-slate-300 text-sm font-inter">
            Players ready: {gameRoomData.readyPlayers.length}/
            {gameRoomData.members.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
