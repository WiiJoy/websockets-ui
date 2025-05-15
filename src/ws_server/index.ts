import { WebSocketServer, WebSocket } from 'ws'

const port = process.env.WS_PORT || 3000

const wss = new WebSocketServer({ port: +port })

wss.on('listening', () => {
    console.log(`Start websocket server on the ${port} port!`)
})

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data) => {
      console.log('received: %s', data)
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