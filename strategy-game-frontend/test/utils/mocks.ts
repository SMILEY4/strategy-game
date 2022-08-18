import {GameApi} from "../../src/external/api/http/gameApi";
import {UserApi} from "../../src/external/api/http/userApi";
import {GameConfigStateAccess} from "../../src/external/state/gameconfig/gameConfigStateAccess";
import {UserStateAccess} from "../../src/external/state/user/userStateAccess";

export function mockUserApi(): UserApi {
    const userApi = {} as UserApi;
    userApi["signUp"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    userApi["login"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    userApi["deleteUser"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    return userApi;
}

export function mockGameApi(): GameApi {
    const api = {} as GameApi;
    api["config"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    return api;
}

export function mockUserStateAccess(): UserStateAccess {
    const userStateAccess = {} as UserStateAccess;
    userStateAccess["setAuth"] = jest.fn().mockReturnValue(undefined);
    userStateAccess["clearAuth"] = jest.fn().mockReturnValue(undefined);
    return userStateAccess;
}

export function mockGameConfigStateAccess(): GameConfigStateAccess {
    const stateAccess = {} as GameConfigStateAccess;
    stateAccess["getGameConfig"] = jest.fn().mockReturnValue(undefined);
    stateAccess["setGameConfig"] = jest.fn().mockReturnValue(undefined);
    return stateAccess;
}