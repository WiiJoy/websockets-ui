import { WebSocketServer, WebSocket } from 'ws'
import handlers from './handlers/'

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
                console.log('add_ships')
                handlers.addShips(data)
                break
            case 'attack':
                console.log('attack')
                break
            case 'randomAttack':
                console.log('randomAttack')
                break
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
        console.log('Disconnected!')
    })
})

wss.on('error', () => {
    console.log('wss Error!')
})

wss.on('close', () => {
    console.log('Close!')
})