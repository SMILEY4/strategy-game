import {Camera} from "../common/webgl/camera";
import {ChangeDetector} from "../common/changeDetector";
import {Command} from "../models/command/command";
import {gameInteractionEngine} from "../app/game/game.interaction-engine";
import {
	WorldObjectMoveInteractionContext,
	worldObjectMoveInteractionDefinition,
} from "../app/game/worldobject/game.worldobject.interaction.move";
import {MapStateAccess} from "../app/game/map/game.map.state-access";
import {TurnStateAccess} from "../app/game/turn/game.turn.state-access";
import {TileStateAccess} from "../app/game/tile/game.tile.state.access";
import {WorldObjectStateAccess} from "../app/game/worldobject/game.worldobject.state-access";
import {CommandStateAccess} from "../app/game/command/game.command.state-access";

export interface TrackedChanges {
    isInitFrame: boolean;
    turn: boolean,
    tiles: boolean,
    worldObjects: boolean,
    commands: boolean,
    mapMode: boolean,
    camera: boolean,
    movementPaths: boolean,
    highlightedTiles: boolean,
    selectedTile: boolean,
    hoveredTile: boolean,
}

export class GameChangeTracker {

    private frameCounter: number = 0;
    private trackedChanges: TrackedChanges = null as any;

    private readonly trackerTurn = new ChangeDetector();
    private readonly trackerTiles = new ChangeDetector();
    private readonly trackerWorldObjects = new ChangeDetector();
    private readonly trackerCommands = new ChangeDetector();
    private readonly trackerMapMode = new ChangeDetector();
    private readonly trackerCamera = new ChangeDetector();
    private readonly trackerMovementPaths = new ChangeDetector();
    private readonly trackerHighlightedTiles = new ChangeDetector();
    private readonly trackerSelectedTile = new ChangeDetector();
    private readonly trackerHoveredTile = new ChangeDetector();

    public initialize() {
        this.frameCounter = 0;
        this.trackedChanges = {
            isInitFrame: true,
            turn: true,
            tiles: true,
            worldObjects: true,
            commands: true,
            mapMode: true,
            camera: true,
            movementPaths: true,
            highlightedTiles: true,
            selectedTile: true,
            hoveredTile: true,
        };
    }

    public prepareFrame(camera: Camera) {
        if (this.frameCounter >= 2) {
            this.trackedChanges.isInitFrame = false;
        } else {
            this.trackedChanges.isInitFrame = true;
            this.frameCounter++;
        }
        this.trackedChanges.turn = this.trackerTurn.check(TurnStateAccess.getCurrentTurn());
        this.trackedChanges.tiles = this.trackerTiles.check(TileStateAccess.getTilesRevId());
        this.trackedChanges.worldObjects = this.trackerWorldObjects.check(WorldObjectStateAccess.getWorldObjectsRevId());
        this.trackedChanges.commands = this.trackerCommands.check(CommandStateAccess.getCommandsRevId());
        this.trackedChanges.mapMode = this.trackerMapMode.check(MapStateAccess.getMapMode());
        this.trackedChanges.camera = this.trackerCamera.check(camera.getHash());
        this.trackedChanges.movementPaths = this.trackerMovementPaths.check(this.getMovementPathsCheckId());
        this.trackedChanges.highlightedTiles = this.trackerHighlightedTiles.check(this.getHighlightedTilesCheckId());
        this.trackedChanges.selectedTile = this.trackerSelectedTile.check(this.getSelectedTileCheckId());
        this.trackedChanges.hoveredTile = this.trackerHoveredTile.check(this.getHoveredTileCheckId());
    }

    public getTrackedChanges(): TrackedChanges {
        return this.trackedChanges;
    }

    private getSelectedTileCheckId(): string {
        const tile = TileStateAccess.getSelected();
        return tile ? tile.id : "-";
    }

    private getHoveredTileCheckId(): string {
        const tile = TileStateAccess.getHovered();
        return tile ? tile.id : "-";
    }

    private getMovementPathsCheckId(): string {
        let str = "";

        // from pending
        if (gameInteractionEngine.getInteractionId() === worldObjectMoveInteractionDefinition.id) {
            const context = gameInteractionEngine.getInteractionContext<WorldObjectMoveInteractionContext>();
            if (context && context.path.length > 0) {
                context.path.forEach(tile => {
                    str += tile.position.q + "," + tile.position.r + "/";
                });
                str += "pending/";
            }
        }

        // from commands
        CommandStateAccess.getAllOfType(Command.Type.Move).forEach(command => {
            command.path.forEach(tile => {
                str += tile.position.q + "," + tile.position.r + "/";
            });
        });

        return str;
    }

    private getHighlightedTilesCheckId(): string {
        let str = "";
        TileStateAccess.getHighlights().forEach(highlight => {
            str += highlight.id + "-" + highlight.type + "/";
        });
        return str;
    }

}