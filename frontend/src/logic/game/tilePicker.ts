import {mat3} from "../../shared/webgl/mat3";
import {Camera} from "../../shared/webgl/camera";
import {Tile} from "../../models/tile";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {TilemapUtils} from "./tilemapUtils";
import {CameraDatabase} from "../../state/cameraDatabase";
import {TileDatabase} from "../../state/tileDatabase";

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
        const viewProjMatrix = this.cameraMatrix(this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
        const clipPos = this.toClipSpace(x, y, this.canvasHandle.getClientWidth(), this.canvasHandle.getClientHeight());
        const worldPos = this.toWorldPos(clipPos[0], clipPos[1], viewProjMatrix)
        const hexPos = this.toHexPos(worldPos[0], worldPos[1]);
        return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, hexPos);
    }


    /**
     * transforms the given xy-screen-position (in range [0,size]) to clip-space (in range [-1,+1])
     */
    private toClipSpace(x: number, y: number, width: number, height: number): [number, number] {
        return [
            (x / width) * 2.0 - 1.0,
            ((height - y) / height) * 2.0 - 1.0,
        ];
    }

    /**
     * transforms the given xy-clipspace-position (in range (in range [-1,+1]) to world coordinates (in range [minWorld,maxWorld])
     */
    private toWorldPos(x: number, y: number, cameraMatrix: Float32Array): [number, number] {
        const invViewProjMatrix = mat3.inverse(cameraMatrix);
        return mat3.transformPoint(invViewProjMatrix, [x, y]);
    }

    /**
     * transforms the given xy-world-position (in range [minWorld,maxWorld]) to qr-hex-position
     */
    private toHexPos(x: number, y: number) {
        return TilemapUtils.pixelToHex(TilemapUtils.DEFAULT_HEX_LAYOUT, [x, y]);
    }

    private cameraMatrix(width: number, height: number): Float32Array {
        const cameraData = this.cameraDb.get();
        const camera = Camera.create(cameraData, width, height, 0, 0);
        return camera.getViewProjectionMatrixOrThrow();
    }
}