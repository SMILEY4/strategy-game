import {GameInputClickAction} from "../src/core/actions/game/gameInputClickAction";
import {mockGameStateAccess, mockTilePicker} from "./mocks";

describe("game", () => {

    test("click on tile", async () => {
        const tilePicker = mockTilePicker();
        const gameStateAccess = mockGameStateAccess();
        const click = new GameInputClickAction(tilePicker, gameStateAccess);
        gameStateAccess["getTurnState"] = jest.fn().mockReturnValue("active");
        tilePicker["tileAt"] = jest.fn().mockReturnValue({
            q: 3,
            r: 2,
            tileId: 42
        });
        // when
        click.perform(4, 2);
        // then
        expect(gameStateAccess.addCommand).toBeCalledWith({
            q: 3,
            r: 2,
        });
    });

    test("click on nothing", async () => {
        const tilePicker = mockTilePicker();
        const gameStateAccess = mockGameStateAccess();
        const click = new GameInputClickAction(tilePicker, gameStateAccess);
        gameStateAccess["getTurnState"] = jest.fn().mockReturnValue("active");
        tilePicker["tileAt"] = jest.fn().mockReturnValue(null);
        // when
        click.perform(4, 2);
        // then
        expect(gameStateAccess.addCommand).toBeCalledTimes(0);
    });

    test("click on tile after submitting turn", async () => {
        const tilePicker = mockTilePicker();
        const gameStateAccess = mockGameStateAccess();
        const click = new GameInputClickAction(tilePicker, gameStateAccess);
        gameStateAccess["getTurnState"] = jest.fn().mockReturnValue("submitted");
        tilePicker["tileAt"] = jest.fn().mockReturnValue({
            q: 3,
            r: 2,
            tileId: 42
        });
        // when
        click.perform(4, 2);
        // then
        expect(gameStateAccess.addCommand).toBeCalledTimes(0);
    });

});

export {};
