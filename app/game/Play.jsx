"use client";
import Header from "@/app/components/Header";
import Players from "@/app/components/Players";
import RoomNotFull from "@/app/components/RoomNotFull";
import RoomFullPlayersNotReady from "@/app/components/RoomFullPlayersNotReady";
import { useState, useEffect } from "react";
import { sampleQuestions } from "./questions";
import { Crown } from "lucide-react";
const Play = ({
  setGameRoomData,
  gameRoomData,
  socket,
  uniqueId,
  setOption,
  results,
  setResults,
  nextQuestion,
  setNextQuestion,
}) => {
  const [countdown, setCountdown] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const currentQuestion = sampleQuestions[gameRoomData.currentQuestionIndex];

  useEffect(() => {
    socket.on("playerAnswered", (data) => {
      setGameRoomData((prev) => ({
        ...prev,
        currentQuestionIndex: data.currentQuestionIndex,
        scores: data.scores,
      }));
    });
    socket.on("nextQuestionReady", (data) => {
      setNextQuestion(true);
      setResults(data);
      setSelectedOption(null);
    });
    socket.on("nextQuestion", (data) => {
      setGameRoomData((prev) => ({
        ...prev,
        currentQuestionIndex: data.currentQuestionIndex,
        scores: data.scores,
      }));
      setNextQuestion(false);
      setResults(null);
      setSelectedOption(null);
    });
    socket.on("gameEnded", (data) => {
      setGameEnded(true);
      setResults(data);
    });
    socket.on("gameRestarted", (data) => {
      console.log("lool");
      console.log("gameRestarted", data);
      setGameRoomData(data);
      setGameEnded(false);
      setResults(null);
      setSelectedOption(null);
      setShowQuestion(false);
      setNextQuestion(false);
      setCountdown(null);
    });
    socket.on("gameStarted", (data) => {
      let count = 3;
      setCountdown(count);
      setSelectedOption(null);

      const timer = setInterval(() => {
        count -= 1;
        if (count < 0) {
          clearInterval(timer);
          setCountdown(null);
          setShowQuestion(true);
        } else {
          setCountdown(count);
        }
      }, 1000);

      return () => clearInterval(timer);
    });
  }, []);

  const handleAnswerClick = (selectedAnswer) => {
    const currentUserStatus = gameRoomData.scores?.find(
      (status) => status.memberId === uniqueId
    );
    if (currentUserStatus.answered !== null) return; // prevent multiple answers
    setSelectedOption(selectedAnswer);
    socket.emit("playerAnswer", gameRoomData.id, uniqueId, selectedAnswer);
  };
  const onNextQuestionClick = () => {
    socket.emit("nextQuestion", gameRoomData.id);
    setSelectedOption(null); // Reset selected option for next question
  };
  const onPlayAgainClick = () => {
    socket.emit("playAgain", gameRoomData.id);
  };
  const onLeaveRoomClick = () => {
    socket.emit("leaveRoom", gameRoomData.id);
    setGameRoomData(null);
    setOption(null);
  };
  const sortScores = (scores) => {
    const sortedScores = scores?.sort((a, b) => b.points - a.points);
    return sortedScores;
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-800/70 via-slate-900 to-slate-800/70 p-6">
      <Header gameRoomData={gameRoomData} />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Players
          gameRoomData={gameRoomData}
          uniqueId={uniqueId}
          socket={socket}
        />
        {/* Game Area */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-[500px] lg:h-[600px] flex items-center justify-center">
            <div className="text-center w-full max-w-md mx-auto">
              {gameRoomData?.members?.length !== gameRoomData?.maxPlayers ? (
                <RoomNotFull gameRoomData={gameRoomData} />
              ) : gameRoomData?.members?.length === gameRoomData?.maxPlayers &&
                gameRoomData?.readyPlayers?.length !==
                  gameRoomData?.members?.length ? (
                <RoomFullPlayersNotReady />
              ) : countdown !== null ? (
                <div className="transform transition-all duration-500 scale-150">
                  <h2 className="text-6xl font-bold text-slate-200 animate-pulse font-orbitron">
                    {countdown}
                  </h2>
                </div>
              ) : showQuestion ? (
                nextQuestion || gameEnded ? (
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
                                  score.answered ===
                                  currentQuestion.correctAnswer
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
                      <p className="text-slate-400 mt-8 text-xl font-semibold">
                        Game ended!
                      </p>
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
                ) : (
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
                              ? "bg-indigo-400"
                              : "hover:bg-white/20"
                          }`}
                          onClick={() => handleAnswerClick(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <h2 className="text-2xl font-semibold text-slate-200 mb-4 tracking-wide font-orbitron">
                  Game is starting...
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex justify-end items-center">
          <button
            className="text-red-400 hover:text-red-300 transition-colors"
            onClick={() => onLeaveRoomClick()}
          >
            Leave Room
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Play;
