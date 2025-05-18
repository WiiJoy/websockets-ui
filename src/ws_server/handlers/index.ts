import { reg } from "./regHandler"
import { createRoom } from "./createRoomHandler"
import { addUser } from "./addUserToRoom"
import { addShips } from "./addShips"
import { attack, randomAttack } from "./handleAttack"

export default { reg, createRoom, addUser, addShips, attack, randomAttack }