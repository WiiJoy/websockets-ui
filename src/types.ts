import { WebSocket } from "ws"

export interface IUser {
    name: string,
    index: string,
    password?: string,
    socket?: WebSocket | null
}

export interface IWinner {
    name: string,
    wins: number
}

export interface IRoomUsers {
    roomId: string,
    roomUsers: IUser[]
}

export enum MessageType {
    reg = 'reg',
    updWinners = 'update_winners',
    updRooms = 'update_room',
    createGame = 'create_game'
}