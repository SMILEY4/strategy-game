import {GameStateContainer} from "../../../models/misc/gameStateContainer";
import {gameInteractionEngine} from "../game.interaction-engine";
import {App} from "../../../appContext";
import {GameSession} from "../../../models/misc/gameSession";
import {CameraService} from "../camera/game.camera.service";
import {Transaction} from "../../../common/db/database/transaction";
import {RealmDatabase} from "../../database/realmDatabase";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {TileDatabase} from "../../database/tileDatabase";
import {Tile} from "../../../models/tile/tile";
import {Db} from "../../database";

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
    Transaction.run([Db.command, Db.tile, Db.realm, Db.worldObject], () => {
        Db.command.deleteAll();
        Db.command.insertMany(state.commands);
        Db.tile.deleteAll();
        Db.tile.insertMany(state.tiles);
        Db.realm.deleteAll();
        Db.realm.insertMany(state.realms);
        Db.worldObject.deleteAll();
        Db.worldObject.insertMany(state.worldObjects);
    });
}

function setCurrentTurn(turn: number) {
    Db.gameSession.update(() => ({
        turn: turn,
    }));
}

function isSessionLoading(): boolean {
    return Db.gameSession.get().sessionState === GameSession.SessionState.Loading;
}

function setSessionPlaying() {
    Db.gameSession.update(() => ({
        sessionState: GameSession.SessionState.Playing,
    }));
}

function setTurnPlaying() {
    Db.gameSession.update(() => ({
        turnState: GameSession.TurnState.Playing,
    }));
}

function findPlayerSpawnTilePosition(): Tile.Position {
    const playerRealm = Db.realm.querySingleOrThrow(RealmDatabase.QUERY_IS_USER_REALM, null);

    // use tile with any unit
    const unitTile = Db.worldObject
        .queryMany(WorldObjectDatabase.QUERY_BY_REALM_ID, playerRealm.id)
        .find(it => it.type.group === WorldObject.TypeGroup.Unit);
    if (unitTile) {
        return unitTile.tile.position;
    }

    // use center tile as fallback
    const tileCenter = Db.tile.querySingle(TileDatabase.QUERY_BY_POSITION, [0, 0]);
    if (tileCenter) {
        return tileCenter.position;
    }

    // everything failed
    throw new Error("Could not find spawn tile.");
}
