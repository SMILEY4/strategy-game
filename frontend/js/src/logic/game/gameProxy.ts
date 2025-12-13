import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {TileService} from "./service/tileService";
import {AudioService, AudioType} from "../../common/audioService";
import {Command} from "../../models/command/command";
import {GameRenderer} from "../../renderer/gameRenderer";
import {WorldObject} from "../../models/worldobject/worldObject";
import {CameraService} from "../../app/game/camera/game.camera.service";
import {CommandService} from "../../app/game/command/game.command.service";
import {gameInteractionEngine} from "../../app/game/game.interaction-engine";
import {
    worldObjectMoveInteractionDefinition,
    WorldObjectMoveInteractionEvent,
} from "../../app/game/worldobject/game.worldobject.interaction.move";
import {
    settlementCreateInteractionDefinition,
    SettlementCreateInteractionEvent,
} from "../../app/game/settlement/game.settlement.interaction.create";

/**
 * Service providing functionality for user interface and direct user interactions. Acts as a proxy to other services
 */
export interface GameProxy {
    // main game loop
    /**
     * Initialize the main game/rendering loop.
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * Update step in the main game/rendering loop.
     */
    update(): void;
    /**
     * Dispose the main game/rendering loop.
     */
    dispose(): void;
    // generic user interactions
    /**
     * Handle a mouse click at the given screen location.
     */
    mouseClicked(clientX: number, clientY: number): void;
    /**
     * Handle a mouse movement event.
     */
    mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean): void;
    /**
     * Handle a mouse scroll event.
     */
    mouseScrolled(d: number, clientX: number, clientY: number): void;
    // world objects
    /**
     * Disband (i.e. delete) the given world object.
     */
    disbandWorldObject(worldObjectId: WorldObject.Id): void;
    /**
     * Construct the given tile improvement using the given world object.
     */
    constructTileImprovement(worldObjectId: WorldObject.Id, tileImprovementType: string): void;
}

export class GameProxyImpl implements GameProxy {

    public readonly canvasHandle: CanvasHandle;

    constructor(
        private readonly gameRenderer: GameRenderer,
        private readonly tileService: TileService,
        private readonly audioService: AudioService,
    ) {
        this.canvasHandle = new CanvasHandle();
    }

    //========== MAIN GAME LOOP ===============================================

    initialize(canvas: HTMLCanvasElement): void {
        this.canvasHandle.set(canvas);
        this.gameRenderer.initialize(this.canvasHandle);
    }

    dispose(): void {
        this.gameRenderer.dispose();
        this.canvasHandle.set(null);
    }

    update(): void {
        this.gameRenderer.render(this.canvasHandle);
    }

    //========== GENERIC USER INTERACTIONS ====================================

    mouseClicked(clientX: number, clientY: number): void {
        const clickedTile = this.tileService.pickTileAt(clientX, clientY, this.canvasHandle);
        if (clickedTile != null) {
            if (gameInteractionEngine.getInteractionId() === worldObjectMoveInteractionDefinition.id) {
                void gameInteractionEngine.dispatch<WorldObjectMoveInteractionEvent>({
                    eventId: "SELECT_TILE",
                    tile: clickedTile,
                });
                return;
            }
            if (gameInteractionEngine.getInteractionId() === settlementCreateInteractionDefinition.id) {
                void gameInteractionEngine.dispatch<SettlementCreateInteractionEvent>({
                    eventId: "SELECT_TILE",
                    tile: clickedTile,
                });
                return;
            }
            this.tileService.clickTile(clickedTile);
            AudioType.CLICK_PRIMARY.play(this.audioService);
        }
    }

    mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean): void {
        if (leftBtnDown) {
            CameraService.move(dx, dy, this.canvasHandle);
        } else {
            this.updateMouseOver(clientX, clientY);
        }
    }

    mouseScrolled(d: number, clientX: number, clientY: number): void {
        CameraService.zoomAt(clientX, clientY, d > 0 ? "out" : "in", this.canvasHandle);
        this.updateMouseOver(clientX, clientY);
    }

    private updateMouseOver(clientX: number, clientY: number) {
        const mouseOverTile = this.tileService.pickTileAt(clientX, clientY, this.canvasHandle);
        this.tileService.mouseOver(mouseOverTile);
    }

    //========== UNITS / WORLD OBJECTS ========================================

    disbandWorldObject(worldObjectId: WorldObject.Id): void {
        CommandService.addCommand({
            type: Command.Type.Disband,
            id: Command.genId(),
            worldObjectId: worldObjectId,
        });
        AudioType.WRITING_ON_PAPER.play(this.audioService);
    }

    constructTileImprovement(worldObjectId: WorldObject.Id, tileImprovementType: string): void {
        CommandService.addCommand({
            type: Command.Type.ConstructTileImprovement,
            id: Command.genId(),
            worldObjectId: worldObjectId,
            tileImprovementType: tileImprovementType,
        });
        AudioType.WRITING_ON_PAPER.play(this.audioService);

    }
}