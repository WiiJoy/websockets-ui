import { v4 as uuidv4 } from 'uuid'
import { IShip, IPlayerData, IShipData, IGame, MessageType } from '#/types'
import { dbGames, dbUsers } from '#/db'
import { messageWrap } from '#/utils/messageUtils'

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
        const indexOfShip = tempShips.find((ship: [number, number, string]) => ship[0] === i && ship[1] === k)

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

    if (currentGame) {
        currentGame.playersData.push({
            index: player,
            data
        })
        handleStartGame(currentGame)
    } else {
        dbGames.push({
            idGame,
            playersData: [{
                index: player,
                data
            }]
        })
    }
}

const handleStartGame = (game: IGame) => {
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
