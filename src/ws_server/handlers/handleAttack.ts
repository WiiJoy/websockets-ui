import { IAttack, IGame, MessageType, IPlayerGame } from "#/types"
import { dbGames, dbUsers } from "#/db"
import { messageWrap } from "#/utils/messageUtils"

export const attack = (data: string) => {
    console.log('attack!')
    const attackData: IAttack = JSON.parse(data)

    const currGame = dbGames.find(game => game.idGame === attackData.gameId)
    if (!currGame) return

    const enemyData = currGame.playersData.find(player => player.index !== attackData.indexPlayer)
    if (!enemyData) return

    const rowData = enemyData.data.field[attackData.x] as (string|number)[]

    const target = rowData[attackData.y]
    console.log('target', target)
    if (typeof target === "string") {
        requestMiss(currGame, attackData.x, attackData.y, attackData.indexPlayer, false, enemyData, target)
    } else {
        requestMiss(currGame, attackData.x, attackData.y, attackData.indexPlayer, true, enemyData)
    }
}

const requestMiss = (game: IGame, x: number, y: number, current: string, isMiss: boolean, enemyData: IPlayerGame, target?: string) => {
    const status = isMiss ? 'miss' : checkStatus(enemyData, target as string)

    const data = {
        position: { x, y },
        currentPlayer: current,
        status
    }
    game.playersData.forEach((player) => {
        const currPlayer = dbUsers.find(user => user.index === player.index)
        if (!currPlayer) return

        currPlayer.socket?.send(messageWrap(JSON.stringify(data), MessageType.attack))
        if (isMiss) currPlayer.socket?.send(messageWrap(JSON.stringify({currentPlayer:enemyData.index}), MessageType.turn))
    })
    if (status === 'killed') killedHandle(enemyData, target as string, current, game)
}

const checkStatus = (enemyData: IPlayerGame, target: string) => {
    const shipList = enemyData.data.ships
    const currShip = shipList.find(ship => ship.index === target)
    console.log('checkStatus', currShip)
    if (!currShip) return 'miss'
    currShip.count -= 1

    if (currShip.count > 0) {
        return 'shot'
    }

    return 'killed'
}

const killedHandle = (enemyData: IPlayerGame, target: string, current: string, game: IGame) => {
    const shipList = enemyData.data.ships
    const currShip = shipList.find(ship => ship.index === target)
    if (!currShip) return

    let posX = currShip.position.x
    let posY = currShip.position.y
    let length = currShip.length

    let startPosX = posX > 0 ? posX - 1 : posX
    let startPosY = posY > 0 ? posY - 1 : posY

    let endPosX = posX
    let endPosY = posY

    if (currShip.direction) {
        endPosX = posX + 1 === 10 ? posX : posX + 1
        endPosY = posY + length === 10 ? posY + length - 1 : posY + length
    } else {
        endPosX = posX + length === 10 ? posX + length - 1 : posX + length
        endPosY = posY + 1 === 10 ? posY  : posY + 1
    }

    for (let i = startPosY; i <= endPosY; i++) {
        for (let k = startPosX; k <= endPosX; k++) {
            const data = {
                position: { x:k, y:i },
                currentPlayer: current,
                status: 'miss'
            }

            game.playersData.forEach((player) => {
                const currPlayer = dbUsers.find(user => user.index === player.index)
                // if (!currPlayer) return
                currPlayer?.socket?.send(messageWrap(JSON.stringify(data), MessageType.attack))
            })
        }
    }

    enemyData.data.count -= 1

    if (enemyData.data.count = 0) {
        game.playersData.forEach((player) => {
            const currPlayer = dbUsers.find(user => user.index === player.index)
            // if (!currPlayer) return
            currPlayer?.socket?.send(messageWrap(JSON.stringify({winPlayer:current}), MessageType.attack))
        })
    }
}