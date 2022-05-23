import {UserLoginActionImpl} from "../src/core/actions/user/userLoginActionImpl";
import {UserLogOutActionImpl} from "../src/core/actions/user/userLogOutActionImpl";
import {UserSignUpActionImpl} from "../src/core/actions/user/userSignUpActionImpl";
import {mockUserApi, mockUserStateAccess} from "./mocks";

describe("user authentication", () => {

    test("sign up", async () => {
        const userApi = mockUserApi();
        const signUp = new UserSignUpActionImpl(userApi);
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
        const login = new UserLoginActionImpl(userApi, userStateAccess)
        // when
        const result = login.perform("test@mail.com", "pass")
        // then
        await expect(result).resolves.toBeUndefined()
        expect(userStateAccess.setAuth).toBeCalledWith("my-id-token")
    })

    test("log out", async () => {
        const userStateAccess = mockUserStateAccess();
        const logOut = new UserLogOutActionImpl(userStateAccess)
        // when
        logOut.perform()
        // then
        expect(userStateAccess.clearAuth).toBeCalled()
    })

});


export {};