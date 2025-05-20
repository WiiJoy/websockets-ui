import { dbRooms } from "#/db"

export const removeRoom = (id: string) => {
    const roomIndex = dbRooms.findIndex(room => room.roomUsers.find(user => user.index === id))
    if (roomIndex >= 0) {
        dbRooms.splice(roomIndex, 1)
    }
}