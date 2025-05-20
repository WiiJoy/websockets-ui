import { reg } from "./regHandler"
import { createRoom } from "./createRoomHandler"
import { addUser } from "./addUserToRoom"
import { addShips } from "./addShips"
import { attack, randomAttack } from "./handleAttack"
import { removeRoom } from "./removeUserRooms"

export default { reg, createRoom, addUser, addShips, attack, randomAttack, removeRoom }