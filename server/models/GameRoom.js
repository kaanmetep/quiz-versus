import { users } from "../../server.mjs";
export const createGameRoom = (
  socketId,
  name,
  category,
  maxPlayers,
  roomId
) => {
  const group = {
    id: roomId,
    members: [{ memberId: users.get(socketId), socketId, name }],
    readyPlayers: [],
    category: category,
    maxPlayers: maxPlayers,
    currentQuestionIndex: 0,
    scores: [{ memberId: users.get(socketId), points: 0, answered: null }],
    isGameStarted: false,
    questionDuration: 10,
    timer: null,
    betweenQuestionsDuration: 5,
    betweenQuestionsTimer: null,
  };
  return group;
};

// WHY we have this function?
// Because we don't want to send the socketId to the client. Thats why we map members to only send the name and memberId.
// we also don't want to send the isGameStarted to the client. its no necessary atm.
export const sendGameRoomToClient = (gameRoom) => {
  return {
    id: gameRoom.id,
    category: gameRoom.category,
    maxPlayers: gameRoom.maxPlayers,
    members: gameRoom.members.map((member) => ({
      name: member.name,
      memberId: member.memberId,
    })),
    readyPlayers: gameRoom.readyPlayers,
    currentQuestionIndex: gameRoom.currentQuestionIndex,
    scores: gameRoom.scores,
    questionDuration: gameRoom.questionDuration,
  };
};
