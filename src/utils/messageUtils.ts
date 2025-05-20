import { dbUsers, dbRooms, dbWinners } from "#/db"
import { IGame, IAttackFeedback, MessageType, IRoomUsers } from "#/types"

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

export const sendAttackMessage = (game: IGame, data: IAttackFeedback) => {
    game.playersData.forEach((player) => {
        const currPlayer = dbUsers.find(user => user.index === player.index)
        currPlayer?.socket?.send(messageWrap(JSON.stringify(data), MessageType.attack))
    })
}

export const sendFinishMessage = (game: IGame, current: string) => {
    game.playersData.forEach((player) => {
        const currPlayer = dbUsers.find(user => user.index === player.index)
        currPlayer?.socket?.send(messageWrap(JSON.stringify({winPlayer:current}), MessageType.finish))
    })
}

export const updateWinnersList = () => {
    dbUsers.forEach(user => {
        user.socket?.send(messageWrap(JSON.stringify(dbWinners.sort((a, b) => a.wins - b.wins)), MessageType.updWinners))
    })
}

export const createRoomMessage = (room: IRoomUsers, idGame: string) => {
    room.roomUsers.forEach((user) => {
        const player = dbUsers.find(item => item.index === user.index)
        player?.socket?.send(messageWrap(JSON.stringify({
            idGame,
            idPlayer: player.index
        }), MessageType.createGame))
    })
}

export const turnMessage = (game: IGame) => {
    game.playersData.forEach((player) => {
        const currPlayer = dbUsers.find(user => user.index === player.index)
        currPlayer?.socket?.send(messageWrap(JSON.stringify({currentPlayer:game.currentPlayer}), MessageType.turn))
    })
}

export const startGameMessage = (game: IGame) => {
    game.playersData.forEach((player) => {
        const currPlayer = dbUsers.find(user => user.index === player.index)
        if (!currPlayer) return

        const data = {
            ships: player.data.ships,
            currentPlayerIndex: currPlayer.index
        }

        currPlayer.socket?.send(messageWrap(JSON.stringify(data), MessageType.startGame))
    })
}