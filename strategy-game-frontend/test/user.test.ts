import {UserLoginAction} from "../src/core/actions/user/userLoginAction";
import {UserLogOutAction} from "../src/core/actions/user/userLogOutAction";
import {UserSignUpAction} from "../src/core/actions/user/userSignUpAction";
import {mockUserApi, mockUserStateAccess} from "./mocks";

describe("user authentication", () => {

    test("sign up", async () => {
        const userApi = mockUserApi();
        const signUp = new UserSignUpAction(userApi);
        // when
        const result = signUp.perform("test@mail.com", "pass", "user")
        // then
        await expect(result).resolves.toBeUndefined()
        expect(userApi.signUp).toBeCalledWith("test@mail.com", "pass", "user")
    });

    test("login", async () => {
        const userApi = mockUserApi();
        userApi["login"] = jest.fn().mockReturnValue(Promise.resolve({
            idToken: "my-id-token",
            refreshToken: "my-refresh-token"
        }))
        const userStateAccess = mockUserStateAccess();
        const login = new UserLoginAction(userApi, userStateAccess)
        // when
        const result = login.perform("test@mail.com", "pass")
        // then
        await expect(result).resolves.toBeUndefined()
        expect(userStateAccess.setAuth).toBeCalledWith("my-id-token")
    })

    test("log out", async () => {
        const userStateAccess = mockUserStateAccess();
        const logOut = new UserLogOutAction(userStateAccess)
        // when
        logOut.perform()
        // then
        expect(userStateAccess.clearAuth).toBeCalled()
    })

});


export {};