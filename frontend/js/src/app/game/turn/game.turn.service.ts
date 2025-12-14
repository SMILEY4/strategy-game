import {GameStateContainer} from "../../../models/misc/gameStateContainer";
import {gameInteractionEngine} from "../game.interaction-engine";
import {App} from "../../../appContext";
import {GameSession} from "../../../models/misc/gameSession";
import {CameraService} from "../camera/game.camera.service";
import {Transaction} from "../../../common/db/database/transaction";
import {RealmDatabase} from "../../../state/database/realmDatabase";
import {WorldObjectDatabase} from "../../../state/database/worldObjectDatabase";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {TileDatabase} from "../../../state/database/tileDatabase";
import {Tile} from "../../../models/tile/tile";

export const TurnService = {

    handleNewGameState(gameState: GameStateContainer): void {
        gameInteractionEngine.end();
        replaceGameState(gameState);
        setCurrentTurn(gameState.turn);
        if (isSessionLoading()) {
            setSessionPlaying();
            CameraService.centerOnTile(findPlayerSpawnTilePosition(), 15);
        }
        setTurnPlaying();
    },

};


function replaceGameState(state: GameStateContainer) {
    Transaction.run([App.commandDatabase, App.tileDatabase, App.realmDatabase, App.worldObjectDatabase], () => {
        App.commandDatabase.deleteAll();
        App.commandDatabase.insertMany(state.commands);
        App.tileDatabase.deleteAll();
        App.tileDatabase.insertMany(state.tiles);
        App.realmDatabase.deleteAll();
        App.realmDatabase.insertMany(state.realms);
        App.worldObjectDatabase.deleteAll();
        App.worldObjectDatabase.insertMany(state.worldObjects);
    });
}

function setCurrentTurn(turn: number) {
    App.gameSessionDatabase.update(() => ({
        turn: turn,
    }));
}

function isSessionLoading(): boolean {
    return App.gameSessionDatabase.get().sessionState === GameSession.SessionState.Loading;
}

function setSessionPlaying() {
    App.gameSessionDatabase.update(() => ({
        sessionState: GameSession.SessionState.Playing,
    }));
}

function setTurnPlaying() {
    App.gameSessionDatabase.update(() => ({
        turnState: GameSession.TurnState.Playing,
    }));
}

function findPlayerSpawnTilePosition(): Tile.Position {
    const playerRealm = App.realmDatabase.querySingleOrThrow(RealmDatabase.QUERY_IS_USER_REALM, null);

    // use tile with any unit
    const unitTile = App.worldObjectDatabase
        .queryMany(WorldObjectDatabase.QUERY_BY_REALM_ID, playerRealm.id)
        .find(it => it.type.group === WorldObject.TypeGroup.Unit);
    if (unitTile) {
        return unitTile.tile.position;
    }

    // use center tile as fallback
    const tileCenter = App.tileDatabase.querySingle(TileDatabase.QUERY_BY_POSITION, [0, 0]);
    if (tileCenter) {
        return tileCenter.position;
    }

    // everything failed
    throw new Error("Could not find spawn tile.");
}
