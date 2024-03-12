import {Camera} from "../../shared/webgl/camera";
import {Tile} from "../../models/tile";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {CameraDatabase} from "../../state/cameraDatabase";
import {TileDatabase} from "../../state/tileDatabase";
import {Projections} from "../../shared/webgl/projections";

export class TilePicker {

    private readonly canvasHandle: CanvasHandle;
    private readonly cameraDb: CameraDatabase;
    private readonly tileDb: TileDatabase;

    constructor(canvasHandle: CanvasHandle, cameraDb: CameraDatabase, tileDb: TileDatabase) {
        this.canvasHandle = canvasHandle;
        this.cameraDb = cameraDb;
        this.tileDb = tileDb;
    }

    public tileAt(x: number, y: number): Tile | null {
        const camera = this.camera(this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
        const hexPos = Projections.screenToHex(camera, x, y);
        return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [hexPos.x, hexPos.y]);
    }

    private camera(width: number, height: number): Camera {
        const cameraData = this.cameraDb.get();
        return Camera.create(cameraData, width, height, 0, 0);
    }
}