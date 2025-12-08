import {UseTileWindow} from "../../../ui/pages/ingame/windows/tile/useTileWindow";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {TileSummary} from "../../../models/tile/tileSummary";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Projections} from "../../../common/webgl/projections";
import {Camera} from "../../../common/webgl/camera";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../../../ui/pages/ingame/windows/unit/useWorldObjectWindow";
import {Tile} from "../../../models/tile/tile";
import HighlightType = Tile.HighlightType;

export interface TileService {
    /**
     * Handle a click-event on the given tile
     */
    clickTile(tile: TileSummary): void;
    /**
     * Handle a mouse-over event on the given tile
     */
    mouseOver(tile: TileSummary | null): void;
    /**
     * Return the tile at the given screen position
     */
    pickTileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): TileSummary | null;
    /**
     * Start tile selection process. The result is later returned in the promise (or null if cancelled).
     */
    selectTile(options: Tile.Position[]): Promise<TileSummary | null>;
    /**
     * Cancels the tile selection process. This resolves the opened promise with null.
     */
    cancelTileSelection(): void;
}

export class TileServiceImpl implements TileService {

    private tileSelectionState: null | ({
        options: Tile.Position[];
        resolve: (value: null | TileSummary | PromiseLike<null | TileSummary>) => void
        reject: () => void;
    }) = null;

    constructor(
        private readonly localStateAccess: GameStateAccess,
        private readonly gameStateWriter: GameStateWriter,
    ) {
    }

    selectTile(options: Tile.Position[]): Promise<TileSummary | null> {
        if (this.tileSelectionState) {
            this.cancelTileSelection();
        }
        this.gameStateWriter.setHighlightedTiles(options.map(it => ({
            type: HighlightType.Option,
            position: it,
            id: ""
        })));
        return new Promise<TileSummary | null>((resolve, reject) => {
            this.tileSelectionState = {
                options: options,
                resolve: resolve,
                reject: reject,
            };
        });
    }

    resolveTileSelection(tile: TileSummary) {
        if (this.tileSelectionState) {
            this.tileSelectionState.resolve(tile);
            this.tileSelectionState = null;
            this.gameStateWriter.setHighlightedTiles([]);
        }
    }

    cancelTileSelection(): void {
        if (this.tileSelectionState) {
            this.tileSelectionState.resolve(null);
            this.tileSelectionState = null;
            this.gameStateWriter.setHighlightedTiles([]);
        }
    }

    clickTile(tile: TileSummary): void {

        if (this.tileSelectionState) {
            this.resolveTileSelection(tile);
            return;
        }

        this.gameStateWriter.setSelectedTile(tile);
        this.gameStateWriter.clearHighlightedTiles(Tile.HighlightType.Active);
        this.gameStateWriter.addHighlightedTiles([{
            type: Tile.HighlightType.Active,
            position: tile.position,
            id: tile.id,
        }]);


        const worldObjects: WorldObjectSummary[] = this.localStateAccess.getWorldObjectSummariesAt(tile.position.q, tile.position.r);
        if (worldObjects.length === 1) {
            UseWorldObjectWindow.open(worldObjects[0].id);
            return;
        }

        UseTileWindow.open(tile.id);
    }

    mouseOver(tile: TileSummary | null): void {
        if (this.localStateAccess.getHoveredTile() !== tile) {
            this.gameStateWriter.setHoveredTile(tile);
        }
    }

    pickTileAt(screenX: number, screenY: number, canvasHandle: CanvasHandle): TileSummary | null {
        const hexPos = Projections.screenToHex(this.camera(canvasHandle), screenX, screenY);
        return this.localStateAccess.getTileSummaryAt(hexPos.x, hexPos.y);
    }

    private camera(canvasHandle: CanvasHandle): Camera {
        const cameraData = this.localStateAccess.getCamera();
        return Camera.create(
            cameraData,
            canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
            canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
        );
    }

}