import {GameLobbyConnectAction} from "../src/core/actions/gamelobby/gameLobbyConnectAction";
import {GameLobbyCreateAction} from "../src/core/actions/gamelobby/gameLobbyCreateAction";
import {GameLobbyJoinAction} from "../src/core/actions/gamelobby/gameLobbyJoinAction";
import {mockGameApi, mockGameMessagingApi, mockGameStateAccess} from "./mocks";

describe("game lobby", () => {

    test("create new lobby", async () => {
        const gameApi = mockGameApi();
        gameApi["create"] = jest.fn().mockReturnValue(Promise.resolve("my-game-id"));
        const create = new GameLobbyCreateAction(gameApi);
        // when
        const result = create.perform();
        // then
        await expect(result).resolves.toBe("my-game-id");
    });

    test("join existing lobby", async () => {
        const gameApi = mockGameApi();
        const join = new GameLobbyJoinAction(gameApi);
        // when
        const result = join.perform("my-game-id");
        // then
        await expect(result).resolves.toBeUndefined();
    });

    test("connect to existing lobby", async () => {
        const msgGameApi = mockGameMessagingApi();
        const gameStateAccess = mockGameStateAccess();
        const connect = new GameLobbyConnectAction(msgGameApi, gameStateAccess);
        // when
        const result = connect.perform("my-game-id");
        // then
        await expect(result).resolves.toBeUndefined();
        expect(msgGameApi.open).toBeCalledWith("my-game-id");
        expect(gameStateAccess.setLoading).toBeCalledWith("my-game-id");
    });

});


export {};