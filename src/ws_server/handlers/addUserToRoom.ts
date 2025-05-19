import { WebSocket } from "ws"
import { dbUsers, dbRooms } from "#/db"
import { createRoomMessage, updateRoomsList } from "#/utils/messageUtils"
import { v4 as uuidv4 } from 'uuid';
import { removeRoom } from "./removeUserRooms";

export const addUser = (data: string, ws: WebSocket) => {
    const roomId: string = JSON.parse(data).indexRoom

    const gameRoom = dbRooms.find(room => room.roomId === roomId)
    const currUser = dbUsers.find(user => user.socket && user.socket === ws)

    if (!gameRoom || !currUser) return

    const isInRoom = gameRoom.roomUsers.find(user => user.index === currUser.index)
    if (isInRoom) return

    removeRoom(currUser.index)

    gameRoom.roomUsers.push({
        name: currUser.name,
        index: currUser.index,
    })

    const roomIndex = dbRooms.findIndex(room => room.roomId === roomId)

    if (gameRoom.roomUsers.length === 2) {
        const idGame = uuidv4()

        createRoomMessage(gameRoom, idGame)

        dbRooms.splice(roomIndex, 1)
        updateRoomsList()
    }
}
