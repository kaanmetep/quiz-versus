const RoomNotFull = ({ gameRoomData }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-200 mb-4 tracking-wide font-orbitron">
        Waiting for Players...
      </h2>
      <p className="text-slate-400 font-inter">
        Share the room code with your friends:{" "}
        <span className="font-mono bg-white/10 rounded-lg px-3 py-1 text-slate-200">
          {gameRoomData.id}
        </span>
      </p>
    </div>
  );
};

export default RoomNotFull;
