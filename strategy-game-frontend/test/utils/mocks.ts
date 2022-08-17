import {UserApi} from "../../src/external/api/http/userApi";
import {UserStateAccess} from "../../src/external/state/user/userStateAccess";

export function mockUserApi(): UserApi {
    const userApi = {} as UserApi;
    userApi["signUp"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    userApi["login"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    userApi["deleteUser"] = jest.fn().mockReturnValue(Promise.resolve(undefined));
    return userApi;
}

export function mockUserStateAccess(): UserStateAccess {
    const userStateAccess = {} as UserStateAccess;
    userStateAccess["setAuth"] = jest.fn().mockReturnValue(undefined);
    userStateAccess["clearAuth"] = jest.fn().mockReturnValue(undefined);
    return userStateAccess;
}
