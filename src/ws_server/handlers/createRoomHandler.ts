import { dbUsers, dbRooms } from "#/db"
import { v4 as uuidv4 } from 'uuid'
import { WebSocket } from "ws"
import { messageWrap } from "#/utils/messageUtils"
import { MessageType } from "#/types"

export const createRoom = (ws: WebSocket) => {
    const id = uuidv4()

    const currUser = dbUsers.find(user => user.socket && user.socket === ws)
    if (!currUser) return

    const { name, index } = currUser

    const roomData = {
        roomId: id,
        roomUsers: [{ name, index }],
    }

    dbRooms.push(roomData)
    dbUsers.forEach(user => {
        if (user.socket) {
            user.socket.send(messageWrap(JSON.stringify(dbRooms), MessageType.updRooms))
        }
    })
}