"use client";
import Header from "@/app/components/Header";
import Players from "@/app/components/Players";
import RoomNotFull from "@/app/components/RoomNotFull";
import RoomFullPlayersNotReady from "@/app/components/RoomFullPlayersNotReady";
import Answers from "@/app/components/Answers";
import Questions from "@/app/components/Questions";
import { useState, useEffect } from "react";
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
  gameEnded,
  setGameEnded,
}) => {
  const [countdown, setCountdown] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const totalQuestions = questions?.length;
  const currentQuestion = questions
    ? questions[gameRoomData.currentQuestionIndex]
    : null;
  useEffect(() => {
    socket.on("playerAnswered", (data) => {
      setGameRoomData((prev) => ({
        ...prev,
        currentQuestionIndex: data.currentQuestionIndex,
        scores: data.scores,
      }));
    });
    socket.on("nextQuestionReady", (data) => {
      setNextQuestion(true); // TODO: change its name to showAnswers
      setResults(data.scores);
      setCorrectAnswer(data.correctAnswer);
      setSelectedOption(null);
    }); // Between 2 questions. Showing answers to the users.
    socket.on("nextQuestion", (data) => {
      setGameRoomData((prev) => ({
        ...prev,
        currentQuestionIndex: data.currentQuestionIndex,
        scores: data.scores,
      }));
      setNextQuestion(false);
      setResults(null);
      setSelectedOption(null);
      socket.emit("startTimer", gameRoomData.id);
    }); // To pass the next question. No showing answers anymore.
    socket.on("gameEnded", (data) => {
      setGameEnded(true);
      setResults(data.scores);
      setCorrectAnswer(data.correctAnswer);
    });
    socket.on("gameRestarted", (data) => {
      setGameRoomData(data);
      setGameEnded(false);
      setResults(null);
      setSelectedOption(null);
      setShowQuestion(false);
      setNextQuestion(false);
      setCountdown(null);
    });
    socket.on("gameStarted", (data) => {
      setQuestions(data);
      let count = 3;
      setCountdown(count);
      setSelectedOption(null);

      const timer = setInterval(() => {
        count -= 1;
        if (count < 0) {
          clearInterval(timer);
          setCountdown(null);
          setShowQuestion(true);
          socket.emit("startTimer", gameRoomData.id);
        } else {
          setCountdown(count);
        }
      }, 1000);

      return () => clearInterval(timer);
    });
    socket.on("remainingTime", (data) => {
      setRemainingTime(data);
    });
  }, []);

  const onLeaveRoomClick = () => {
    socket.emit("leaveRoom", gameRoomData.id);
    setGameRoomData(null);
    setOption(null);
    setResults(null);
    setNextQuestion(null);
    setGameEnded(false);
  };
  console.log(countdown);
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
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-[500px] lg:h-[600px] flex items-center justify-center relative">
            <div className="text-center w-full max-w-md mx-auto">
              {gameRoomData?.members?.length !==
              gameRoomData?.numberOfPlayers ? (
                <RoomNotFull gameRoomData={gameRoomData} />
              ) : gameRoomData?.members?.length ===
                  gameRoomData?.numberOfPlayers &&
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
                  <Answers
                    results={results}
                    gameRoomData={gameRoomData}
                    gameEnded={gameEnded}
                    socket={socket}
                    setSelectedOption={setSelectedOption}
                    correctAnswer={correctAnswer}
                  />
                ) : (
                  <Questions
                    currentQuestion={currentQuestion}
                    selectedOption={selectedOption}
                    socket={socket}
                    gameRoomData={gameRoomData}
                    setSelectedOption={setSelectedOption}
                    uniqueId={uniqueId}
                    remainingTime={remainingTime}
                    gameEnded={gameEnded}
                    totalQuestions={totalQuestions}
                  />
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
