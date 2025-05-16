import { v4 as uuidv4 } from 'uuid'
import { IUser } from '@/types'
import { dbUsers } from '@/db'
import { WebSocket } from 'ws'
import { messageWrap } from '@/utils/messageUtils'
import { prepareUser } from '@/utils/prepareData'

export const reg = (data: string, ws: WebSocket, type: string) => {
    const { name, password } = JSON.parse(data)
    const id = uuidv4()
    const user: IUser = {
        name,
        password,
        index: id
    }

    dbUsers.push(user)

    ws.send(messageWrap(JSON.stringify(prepareUser(name, id)), type))
    console.log('This is user!', user)
}