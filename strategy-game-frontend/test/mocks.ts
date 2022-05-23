import {GameApi} from "../src/ports/required/api/gameApi";
import {GameMessagingApi} from "../src/ports/required/api/gameMessagingApi";
import {UserApi} from "../src/ports/required/api/userApi";
import {GameStateAccess} from "../src/ports/required/state/gameStateAccess";
import {UserStateAccess} from "../src/ports/required/state/userStateAccess";
import {WorldStateAccess} from "../src/ports/required/state/worldStateAccess";

export function mockUserApi(): UserApi {
    const userApi = {} as UserApi
    userApi["signUp"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    userApi["login"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    userApi["deleteUser"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    return userApi
}

export function mockUserStateAccess(): UserStateAccess {
    const userStateAccess = {} as UserStateAccess
    userStateAccess["setAuth"] = jest.fn().mockReturnValue(undefined)
    userStateAccess["clearAuth"] = jest.fn().mockReturnValue(undefined)
    return userStateAccess
}

export function mockGameApi(): GameApi {
    const gameApi = {} as GameApi
    gameApi["create"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    gameApi["join"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    gameApi["list"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    return gameApi
}

export function mockGameMessagingApi(): GameMessagingApi {
    const gameMsgApi = {} as GameMessagingApi
    gameMsgApi["open"] = jest.fn().mockReturnValue(Promise.resolve(undefined))
    gameMsgApi["close"] = jest.fn().mockReturnValue(undefined)
    gameMsgApi["sendSubmitTurn"] = jest.fn().mockReturnValue(undefined)
    return gameMsgApi
}

export function mockGameStateAccess(): GameStateAccess {
    const gameStateAccess = {} as GameStateAccess
    gameStateAccess["setLoading"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["getCurrentState"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["setCurrentState"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["setTurnState"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["getCommands"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["addCommand"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["clearCommands"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["moveCamera"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["zoomCamera"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["getCamera"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["setTileMouseOver"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["clearTileMouseOver"] = jest.fn().mockReturnValue(undefined)
    gameStateAccess["getTileMouseOver"] = jest.fn().mockReturnValue(undefined)
    return gameStateAccess;
}

export function mockWorldStateAccess(): WorldStateAccess {
    const worldStateAccess = {} as WorldStateAccess
    worldStateAccess["getTile"] = jest.fn().mockReturnValue(undefined)
    worldStateAccess["getTiles"] = jest.fn().mockReturnValue(undefined)
    worldStateAccess["setTiles"] = jest.fn().mockReturnValue(undefined)
    worldStateAccess["getMarkers"] = jest.fn().mockReturnValue(undefined)
    worldStateAccess["setMarkers"] = jest.fn().mockReturnValue(undefined)
    return worldStateAccess
}