import { Crown } from "lucide-react";
const Answers = ({
  results,
  gameRoomData,
  currentQuestion,
  gameEnded,
  socket,
  setSelectedOption,
}) => {
  const onNextQuestionClick = () => {
    socket.emit("nextQuestion", gameRoomData.id);
    setSelectedOption(null); // Reset selected option for next question
  };
  const onPlayAgainClick = () => {
    socket.emit("playAgain", gameRoomData.id);
  };
  const sortScores = (scores) => {
    const sortedScores = scores?.sort((a, b) => b.points - a.points);
    return sortedScores;
  };
  return (
    <>
      <h2 className="text-2xl font-semibold text-slate-200 mb-4 tracking-wide font-orbitron">
        Answers
      </h2>
      <div className="flex flex-col  space-y-4 w-full max-w-lg mx-auto">
        {sortScores(results?.scores)?.map((score, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 grid grid-cols-[2fr_1fr_1fr] gap-10  "
          >
            <div className="flex items-center  gap-2">
              <div className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ">
                {index + 1}
              </div>

              <p className="font-medium text-white text-sm lg:text-base">
                {
                  gameRoomData?.members?.find(
                    (member) => member.memberId === score.memberId
                  )?.name
                }
              </p>
            </div>

            <div className="flex space-x-6 justify-center items-center ">
              <div className="text-center">
                <p className="text-xs text-gray-400">Answer</p>
                <p
                  className={`${
                    score.answered === currentQuestion.correctAnswer
                      ? "text-green-500"
                      : "text-red-500"
                  } text-xs lg:text-base`}
                >
                  {score.answered}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Points</p>
              <p className="font-bold text-yellow-500 text-xs lg:text-base">
                {score.points}
              </p>
            </div>
            {index === 0 && (
              <Crown className="w-8 h-8 text-yellow-500 absolute -top-4 -left-3" />
            )}
          </div>
        ))}
      </div>
      <p className="text-slate-400 mt-8">
        The correct answer is:{" "}
        <span className="font-bold text-green-500">
          {currentQuestion.correctAnswer}
        </span>
      </p>
      {gameEnded && (
        <p className="text-slate-400 mt-8 text-xl font-semibold">Game ended!</p>
      )}
      <button
        className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white rounded-xl px-6 py-2 font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(37,_99,_235,_0.5)] transition-all duration-300 hover:scale-[1.02] border border-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed mt-12"
        onClick={
          !gameEnded
            ? () => onNextQuestionClick()
            : () => {
                onPlayAgainClick();
              }
        }
      >
        {gameEnded ? "Play Again" : "Next Question"}
      </button>
    </>
  );
};

export default Answers;
