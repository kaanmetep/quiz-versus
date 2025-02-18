import {
  QUESTION_DURATION,
  BETWEEN_QUESTIONS_DURATION,
} from "../../constans.js";
import { users } from "../../server.mjs";
export const createGameRoom = (
  socketId,
  playerName,
  category,
  numberOfPlayers,
  roomId
) => {
  const group = {
    id: roomId,
    members: [{ memberId: users.get(socketId), socketId, playerName }],
    readyPlayers: [],
    category,
    numberOfPlayers: numberOfPlayers,
    currentQuestionIndex: 0,
    scores: [{ memberId: users.get(socketId), points: 0, answered: null }],
    isGameStarted: false,
    questionDuration: QUESTION_DURATION,
    timer: null,
    betweenQuestionsTimer: null,
    betweenQuestionsDuration: BETWEEN_QUESTIONS_DURATION,
  };
  return group;
};

// WHY do we have this function?
// Because we don't want to send the socketId to the client. Thats why we map members to only send the name and memberId.
// we also don't want to send the isGameStarted to the client. its no necessary atm.
export const sendGameRoomToClient = (gameRoom) => {
  return {
    id: gameRoom.id,
    category: gameRoom.category,
    numberOfPlayers: gameRoom.numberOfPlayers,
    members: gameRoom.members.map((member) => ({
      playerName: member.playerName,
      memberId: member.memberId,
    })),
    readyPlayers: gameRoom.readyPlayers,
    currentQuestionIndex: gameRoom.currentQuestionIndex,
    scores: gameRoom.scores,
    questionDuration: gameRoom.questionDuration,
  };
};
