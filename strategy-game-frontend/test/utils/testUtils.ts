import {UserLoginAction} from "../../src/core/userLoginAction";
import {UserLogOutAction} from "../../src/core/userLogOutAction";
import {UserSignUpAction} from "../../src/core/userSignUpAction";
import {mockGameApi, mockGameConfigStateAccess, mockUserApi, mockUserStateAccess} from "./mocks";

export async function testCtx(block: (ctx: TestContext) => any) {
    const ctx = new TestContext();
    await block(ctx);
}

export class TestContext {

    static readonly ID_TOKEN = "test-id-token";
    static readonly REFRESH_TOKEN = "test-refresh-token";

    private readonly userApi = mockUserApi();
    private readonly gameApi = mockGameApi();
    private readonly userStateAccess = mockUserStateAccess();
    private readonly gameConfigStateAccess = mockGameConfigStateAccess();

    constructor() {
        this.userApi["login"] = jest.fn().mockReturnValue(Promise.resolve({
            idToken: TestContext.ID_TOKEN,
            refreshToken: TestContext.REFRESH_TOKEN
        }));
    }

    async signUp(email: string, password: string, username: string) {
        const result = new UserSignUpAction(this.userApi).perform(email, password, username);
        await expect(result).resolves.toBeUndefined();
    }

    async login(email: string, password: string) {
        const result = new UserLoginAction(this.userApi, this.gameApi, this.userStateAccess, this.gameConfigStateAccess).perform(email, password);
        await expect(result).resolves.toBeUndefined();
    }

    async logOut() {
        new UserLogOutAction(this.userStateAccess).perform();
    }

    expectApiCall_signUp(email: string, password: string, username: string) {
        expect(this.userApi.signUp).toBeCalledWith(email, password, username);
    }

    expectAuthSet() {
        expect(this.userStateAccess.setAuth).toBeCalledWith(TestContext.ID_TOKEN);
    }

    expectAuthCleared() {
        expect(this.userStateAccess.clearAuth).toBeCalled();
    }

}