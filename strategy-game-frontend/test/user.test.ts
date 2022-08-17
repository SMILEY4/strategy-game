import {testCtx} from "./utils/testUtils";

describe("user authentication", () => {

    test("sign up", async () => testCtx(async ctx => {
        await ctx.signUp("test@mail.com", "pass", "user");
        ctx.expectApiCall_signUp("test@mail.com", "pass", "user");
    }));

    test("login", async () => testCtx(async ctx => {
        await ctx.login("test@mail.com", "pass");
        ctx.expectAuthSet();
    }));

    test("log out", async () => testCtx(ctx => {
        ctx.logOut();
        ctx.expectAuthCleared();
    }));

});


export {};