const Questions = ({
  currentQuestion,
  selectedOption,
  socket,
  gameRoomData,
  setSelectedOption,
  uniqueId,
  remainingTime,
  gameEnded,
  totalQuestions,
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
    <div className="space-y-6 w-full max-w-2xl">
      <div className="absolute top-2 right-2">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 w-[45px] h-[45px] sm:w-[80px] sm:h-[80px] flex items-center justify-center">
          <p className="text-xl sm:text-4xl font-bold text-slate-200 font-orbitron tabular-nums">
            {!gameEnded && remainingTime}
          </p>
        </div>
      </div>
      <p className="text-sm sm:text-xl font-bold text-slate-200 font-orbitron tabular-nums absolute top-0 left-6">
        {!gameEnded &&
          gameRoomData.currentQuestionIndex + 1 + " / " + totalQuestions}
      </p>

      <h2 className="lg:text-2xl font-semibold text-slate-200 tracking-wide mb-12 font-orbitron">
        {currentQuestion.question}
      </h2>
      <div className="flex flex-col space-y-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`w-full bg-white/10 py-6 px-8 rounded-xl text-slate-200 transition-all text-xs lg:text-base text-left font-inter ${
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
