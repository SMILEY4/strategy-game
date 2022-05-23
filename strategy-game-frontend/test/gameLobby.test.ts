import {GameLobbyConnectActionImpl} from "../src/core/actions/gamelobby/gameLobbyConnectActionImpl";
import {GameLobbyCreateActionImpl} from "../src/core/actions/gamelobby/gameLobbyCreateActionImpl";
import {GameLobbyJoinActionImpl} from "../src/core/actions/gamelobby/gameLobbyJoinActionImpl";
import {mockGameApi, mockGameMessagingApi, mockGameStateAccess} from "./mocks";

describe("game lobby", () => {

    test("create new lobby", async () => {
        const gameApi = mockGameApi();
        gameApi["create"] = jest.fn().mockReturnValue(Promise.resolve("my-game-id"));
        const create = new GameLobbyCreateActionImpl(gameApi);
        // when
        const result = create.perform();
        // then
        await expect(result).resolves.toBe("my-game-id");
    });

    test("join existing lobby", async () => {
        const gameApi = mockGameApi();
        const join = new GameLobbyJoinActionImpl(gameApi);
        // when
        const result = join.perform("my-game-id");
        // then
        await expect(result).resolves.toBeUndefined();
    });

    test("connect to existing lobby", async () => {
        const msgGameApi = mockGameMessagingApi();
        const gameStateAccess = mockGameStateAccess();
        const connect = new GameLobbyConnectActionImpl(msgGameApi, gameStateAccess);
        // when
        const result = connect.perform("my-game-id");
        // then
        await expect(result).resolves.toBeUndefined();
        expect(msgGameApi.open).toBeCalledWith("my-game-id");
        expect(gameStateAccess.setLoading).toBeCalledWith("my-game-id");
    });

});


export {};