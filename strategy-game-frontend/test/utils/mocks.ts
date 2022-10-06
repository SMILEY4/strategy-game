import {HttpGameApi} from "../../src/external/api/http/gameApi";
import {HttpUserApi} from "../../src/external/api/http/userApi";
import {GameConfigStateAccess} from "../../src/external/state/gameconfig/gameConfigStateAccess";
import {UserStateAccess} from "../../src/external/state/user/userStateAccess";

export function mockUserApi(): HttpUserApi {
    const userApi = {} as HttpUserApi;
    userApi["signUp"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    userApi["login"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    userApi["deleteUser"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    return userApi;
}

export function mockGameApi(): HttpGameApi {
    const api = {} as HttpGameApi;
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