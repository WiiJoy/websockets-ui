import { v4 as uuidv4 } from 'uuid'
import { IUser } from '@/types'
import { dbUsers } from '@/db'
import { WebSocket } from 'ws'

export const reg = (data: string, ws: WebSocket) => {
    const { name, password } = JSON.parse(data)
    const id = uuidv4()
    const user: IUser = {
        name,
        password,
        index: id
    }

    dbUsers.push(user)

    ws.send(JSON.stringify({
        type: 'reg',
        data: JSON.stringify('I am new user!'),
        id: 0,
    }))
    console.log('This is user!', user)
}