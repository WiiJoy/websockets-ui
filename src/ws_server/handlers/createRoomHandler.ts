import { dbUsers, dbRooms } from "#/db"
import { v4 as uuidv4 } from 'uuid'
import { WebSocket } from "ws"
import { updateRoomsList } from "#/utils/messageUtils"
import { removeRoom } from "./removeUserRooms"

export const createRoom = (ws: WebSocket) => {
    const id = uuidv4()

    const currUser = dbUsers.find(user => user.socket && user.socket === ws)
    if (!currUser) return

    const { name, index } = currUser

    removeRoom(index)

    const roomData = {
        roomId: id,
        roomUsers: [{ name, index }],
    }

    dbRooms.push(roomData)
    updateRoomsList()
}