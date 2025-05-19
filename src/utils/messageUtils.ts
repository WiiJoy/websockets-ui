import { dbUsers, dbRooms } from "#/db"
import { MessageType } from "#/types"

export const messageWrap = (data: string, type: string) => {
    const request = JSON.stringify({
        id: 0,
        type,
        data
    })

    console.log(`Answer: ${request}`)

    return request
}

export const updateRoomsList = () => {
    dbUsers.forEach(user => {
        user.socket?.send(messageWrap(JSON.stringify(dbRooms), MessageType.updRooms))
    })
}