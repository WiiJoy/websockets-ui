import { IAttack, IGame, MessageType, IPlayerGame } from "#/types"
import { dbGames, dbUsers, dbWinners } from "#/db"
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
        handleShot(currGame, attackData.x, attackData.y, attackData.indexPlayer, false, enemyData, target)
    } else {
        handleShot(currGame, attackData.x, attackData.y, attackData.indexPlayer, true, enemyData)
    }
    rowData[attackData.y] = 1
}

export const randomAttack = (data: string) => {
    const attackData: {
        gameId: string,
        indexPlayer: string
    } = JSON.parse(data)

    const currGame = dbGames.find(game => game.idGame === attackData.gameId)
    if (!currGame) return

    const enemyData = currGame.playersData.find(player => player.index !== attackData.indexPlayer)
    if (!enemyData) return

    let x = 0
    let y = 0

    let rowData = enemyData.data.field[x] as (string|number)[]

    let target = rowData[y]

    do {
        x = Math.floor(Math.random() * 10)
        y = Math.floor(Math.random() * 10)
        rowData = enemyData.data.field[x] as (string|number)[]
        target = rowData[y]
    } while (target === 1);

    if (typeof target === "string") {
        handleShot(currGame, x, y, attackData.indexPlayer, false, enemyData, target)
    } else {
        handleShot(currGame, x, y, attackData.indexPlayer, true, enemyData)
    }
    rowData[y] = 1
}

const handleShot = (game: IGame, x: number, y: number, current: string, isMiss: boolean, enemyData: IPlayerGame, target?: string) => {
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
    })
    if (status === 'killed') killedHandle(enemyData, target as string, current, game)
    if (isMiss) {
        game.currentPlayer = enemyData.index
    }
    handleSetTurn(game)
    
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

    let shipXPos: [number, number] = [posX, posX]
    let shipYPos: [number, number] = [posY, posY]

    if (currShip.direction) {
        endPosX = posX + 1 === 10 ? posX : posX + 1
        endPosY = posY + length === 10 ? posY + length - 1 : posY + length
        shipYPos[1] = posY + length - 1
    } else {
        endPosX = posX + length === 10 ? posX + length - 1 : posX + length
        endPosY = posY + 1 === 10 ? posY  : posY + 1
        shipXPos[1] = posX + length - 1
    }

    for (let i = startPosY; i <= endPosY; i++) {
        for (let k = startPosX; k <= endPosX; k++) {
            const isOnShip = checkIsShipPosition(shipXPos, shipYPos, k, i)

            const data = {
                position: { x:k, y:i },
                currentPlayer: current,
                status: isOnShip ? 'killed' : 'miss'
            }

            if (!isOnShip) {
                const rowData = enemyData.data.field[k] as (string|number)[]
                rowData[i] = 1
            }

            game.playersData.forEach((player) => {
                const currPlayer = dbUsers.find(user => user.index === player.index)
                currPlayer?.socket?.send(messageWrap(JSON.stringify(data), MessageType.attack))
            })
        }
    }

    enemyData.data.count += -1 

    if (enemyData.data.count === 0) {
        console.log('set finish', current)
        let winner: string = ''
        game.playersData.forEach((player) => {
            const currPlayer = dbUsers.find(user => user.index === player.index)
            if (currPlayer?.index === current) winner = currPlayer.name
            currPlayer?.socket?.send(messageWrap(JSON.stringify({winPlayer:current}), MessageType.finish))
        })
        handleWinners(winner)
    }
}

const handleWinners = (winner: string ) => {
    const winnerInList = dbWinners.find(user => user.name === winner)

    if (!winnerInList) {
        dbWinners.push({
            name: winner,
            wins: 1
        })
    } else {
        winnerInList.wins += 1
    }

    dbUsers.forEach(user => {
        user.socket?.send(messageWrap(JSON.stringify(dbWinners.sort((a, b) => a.wins - b.wins)), MessageType.updWinners))
    })
}

const checkIsShipPosition = (shipX: [number, number], shipY: [number, number], x:number, y:number): boolean => {
    const checkX = x >= shipX[0] && x <= shipX[1]
    const checkY = y >= shipY[0] && y <= shipY[1]

    return checkX && checkY
}

const handleSetTurn = (game: IGame) => {
    game.playersData.forEach((player) => {
        const currPlayer = dbUsers.find(user => user.index === player.index)
        currPlayer?.socket?.send(messageWrap(JSON.stringify({currentPlayer:game.currentPlayer}), MessageType.turn))
    })
}
