const Questions = ({
  currentQuestion,
  selectedOption,
  socket,
  gameRoomData,
  setSelectedOption,
  uniqueId,
}) => {
  const handleAnswerClick = (selectedAnswer) => {
    const currentUserStatus = gameRoomData.scores?.find(
      (status) => status.memberId === uniqueId
    );
    if (currentUserStatus.answered !== null) return; // prevent multiple answers
    setSelectedOption(selectedAnswer);
    socket.emit("playerAnswer", gameRoomData.id, uniqueId, selectedAnswer);
  };

  return (
    <div className="space-y-8 w-full max-w-2xl">
      <h2 className="text-xl lg:text-3xl font-semibold text-slate-200 tracking-wide mb-12 font-orbitron">
        {currentQuestion.question}
      </h2>
      <div className="flex flex-col space-y-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`w-full bg-white/10 py-6 px-8 rounded-xl text-slate-200 transition-all text-sm lg:text-lg text-left font-inter ${
              selectedOption === option
                ? "!bg-indigo-700 !text-white"
                : "hover:bg-white/20"
            }`}
            onClick={() => handleAnswerClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Questions;
