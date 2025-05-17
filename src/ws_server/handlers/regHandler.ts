import { v4 as uuidv4 } from 'uuid'
import { IUser, MessageType } from '#/types'
import { dbUsers, dbWinners, dbRooms } from '#/db'
import { WebSocket } from 'ws'
import { messageWrap } from '#/utils/messageUtils'
import { prepareUser } from '#/utils/prepareData'

export const reg = (data: string, ws: WebSocket, type: string) => {
    const { name, password } = JSON.parse(data)
    const id = uuidv4()
    const user: IUser = {
        name,
        password,
        index: id,
        socket: ws
    }

    dbUsers.push(user)

    ws.send(messageWrap(JSON.stringify(prepareUser(name, id)), type))
    ws.send(messageWrap(JSON.stringify(dbWinners.sort((a, b) => a.wins - b.wins)), MessageType.updWinners))
    ws.send(messageWrap(JSON.stringify(dbRooms), MessageType.updRooms))
}