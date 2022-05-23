import {TurnSubmitActionImpl} from "../src/core/actions/turn/turnSubmitActionImpl";
import {TurnUpdateWorldStateActionImpl} from "../src/core/actions/turn/turnUpdateWorldStateActionImpl";
import {mockGameMessagingApi, mockGameStateAccess, mockWorldStateAccess} from "./mocks";

describe("turn", () => {

    test("submit turn", async () => {
        const gameStateAccess = mockGameStateAccess();
        const gameMsgApi = mockGameMessagingApi();
        const submit = new TurnSubmitActionImpl(gameStateAccess, gameMsgApi);
        gameStateAccess["getCurrentState"] = jest.fn().mockReturnValue("active");
        gameStateAccess["getCommands"] = jest.fn().mockReturnValue([
            {q: 1, r: 2},
            {q: 4, r: 4}
        ]);
        // when
        submit.perform();
        // then
        expect(gameMsgApi.sendSubmitTurn).toBeCalledWith([
            {q: 1, r: 2},
            {q: 4, r: 4}
        ]);
        expect(gameStateAccess.setTurnState).toBeCalledWith("submitted");
    });

    test("update world state (e.g. at end of turn)", async () => {
        const gameStateAccess = mockGameStateAccess();
        const worldStateAccess = mockWorldStateAccess();
        const update = new TurnUpdateWorldStateActionImpl(gameStateAccess, worldStateAccess);
        gameStateAccess["getCurrentState"] = jest.fn().mockReturnValue("loading");
        // when
        update.perform(
            [
                {q: 1, r: 6, tileId: 1},
                {q: 4, r: 7, tileId: 2},
                {q: 6, r: 3, tileId: 3}
            ],
            [
                {q: 1, r: 6, userId: "user-1"},
                {q: 6, r: 3, userId: "user-2"}
            ]
        );
        // then
        expect(gameStateAccess.setCurrentState).toBeCalledWith("active")
        expect(gameStateAccess.setTurnState).toBeCalledWith("active")
        expect(gameStateAccess.clearCommands).toBeCalled()
        expect(worldStateAccess.setTiles).toBeCalledWith([
            {q: 1, r: 6, tileId: 1},
            {q: 4, r: 7, tileId: 2},
            {q: 6, r: 3, tileId: 3}
        ])
        expect(worldStateAccess.setMarkers).toBeCalledWith([
            {q: 1, r: 6, userId: "user-1"},
            {q: 6, r: 3, userId: "user-2"}
        ])
    });

});


export {};