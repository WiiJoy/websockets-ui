import { WebSocket } from "ws"
import { dbUsers, dbRooms } from "#/db"
import { messageWrap } from "#/utils/messageUtils"
import { v4 as uuidv4 } from 'uuid';
import { MessageType } from "#/types"

export const addUser = (data: string, ws: WebSocket) => {
    const roomId: string = JSON.parse(data).indexRoom

    const gameRoom = dbRooms.find(room => room.roomId === roomId)
    const currUser = dbUsers.find(user => user.socket && user.socket === ws)

    if (!gameRoom || !currUser) return

    gameRoom.roomUsers.push({
        name: currUser.name,
        index: currUser.index,
    })

    const idGame = uuidv4()

    gameRoom.roomUsers.forEach((user) => {
        const player = dbUsers.find(item => item.index === user.index)
        if (!player) return
        const playerData = {
            idPlayer: player.index,
            idGame
        }
        player?.socket?.send(messageWrap(JSON.stringify(playerData), MessageType.createGame))
    })
}
