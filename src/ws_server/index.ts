import { WebSocketServer, WebSocket } from 'ws'
import handlers from './handlers/'
import { dbUsers } from '#/db'
import { updateRoomsList } from '#/utils/messageUtils'

const port = process.env.WS_PORT || 3000

const wss = new WebSocketServer({ port: +port })

wss.on('listening', () => {
    console.log(`Start websocket server on the ${port} port!`)
})

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (json) => {
      try {
        console.log(`Request: ${json}`)
        const { type, data } = JSON.parse(json.toString())
        switch (type) {
            case 'reg':
                handlers.reg(data, ws, type)
                break
            case 'create_room':
                handlers.createRoom(ws)
                break
            case 'add_user_to_room':
                handlers.addUser(data, ws)
                break
            case 'add_ships':
                handlers.addShips(data)
                break
            case 'attack':
                handlers.attack(data)
                break
            case 'randomAttack':
                handlers.randomAttack(data)
                break
            case 'single_play':
                console.log('Single game is not exist')
            default:
                console.log('Unknown command')
        }
      } catch (error) {
        console.error('Error!')
      }
    })

    ws.on('error', () => {
        console.error('ws Error!')
    })

    ws.on('close', () => {
        const disconnectedUser = dbUsers.find(user => user.socket === ws)
        if (!disconnectedUser) return
        disconnectedUser.socket = null
        handlers.removeRoom(disconnectedUser.index)
        updateRoomsList()
        console.log('Disconnected!')
    })
})

wss.on('error', () => {
    console.log('wss Error!')
})

wss.on('close', () => {
    console.log('Close!')
})