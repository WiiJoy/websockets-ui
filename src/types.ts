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


export interface IPlayerData {
    ships: IShip[],
    count: number,
    field: Array<Array<string|number>>
}

export interface IPosition {
    x: number,
    y: number
}

export interface IShipData {
    position: IPosition,
    direction: boolean,
    length: number,
    type: "small"|"medium"|"large"|"huge",
}

export interface IShip extends IShipData {
    index: string;
    count: number;
}

export interface IPlayerGame {
    index: string,
    data: IPlayerData
}

export interface IGame {
    idGame: string;
    playersData: IPlayerGame[]
}

export enum MessageType {
    reg = 'reg',
    updWinners = 'update_winners',
    updRooms = 'update_room',
    createGame = 'create_game',
    startGame = 'start_game'
}