import { v4 as uuidv4 } from 'uuid'
import { IShip, IPlayerData, IShipData, IPlayerGame } from '#/types'
import { dbGames } from '#/db'
import { startGameMessage, turnMessage } from '#/utils/messageUtils'

export const addShips = (data: string) => {
    const shipsData = JSON.parse(data)

    const playerData: IPlayerData = {
        ships: [],
        count: 0,
        field: [[]]
    }

    const tempShips: Array<[number, number, string]> = []

    shipsData.ships.forEach((item: IShipData) => {
        const id = uuidv4()
        const ship: IShip = {
            ...item,
            index: id,
            count: item['length'],
        }

        playerData.ships.push(ship)
        playerData.count += 1

        let startX = +item.position.x
        let startY = +item.position.y

        for (let i = 0; i < ship.count; i++) {
            let currXPos = startX
            let currYPos = startY
            
            if (item.direction) {
                currYPos += i
            } else {
                currXPos += i
            }

            tempShips.push([currXPos, currYPos, id])
        }
    })

    let field: Array<Array<string|number>> = Array.from({ length: 10 }, (_v, k) => Array.from({ length: 10 }, (_n, i) => {
        const indexOfShip = tempShips.find((ship: [number, number, string]) => ship[0] === k && ship[1] === i)

        if (indexOfShip) {
            return indexOfShip[2]
        } else {
            return 0
        }
    }))

    playerData.field = field

    handleGameData(shipsData.gameId, shipsData.indexPlayer, playerData)
}

const handleGameData = (idGame: string, player: string, data: IPlayerData) => {
    const currentGame = dbGames.find(game => game.idGame === idGame)

    const playerData: IPlayerGame = {
        index: player,
        data
    }

    if (currentGame) {
        currentGame.playersData.push(playerData)
        startGameMessage(currentGame)
        turnMessage(currentGame)
    } else {
        dbGames.push({
            idGame,
            currentPlayer: player,
            playersData: [playerData]
        })
    }
}
