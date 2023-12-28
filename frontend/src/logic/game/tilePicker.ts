import {mat3} from "../../shared/webgl/mat3";
import {Camera} from "../../shared/webgl/camera";
import {Tile} from "../../models/tile";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {TilemapUtils} from "./tilemapUtils";
import {CameraDatabase} from "../../state_new/cameraDatabase";
import {TileDatabase} from "../../state_new/tileDatabase";

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
        const mouseClipPos = this.toClipSpace(x, y, this.canvasHandle.getClientWidth(), this.canvasHandle.getClientHeight());
        const viewProjMatrix = this.cameraMatrix(this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
        const hexPos = TilePicker.toHexPos(viewProjMatrix, mouseClipPos);
        return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, hexPos);
    }


    private toClipSpace(x: number, y: number, width: number, height: number): [number, number] {
        return [
            (x / width) * 2.0 - 1.0,
            ((height - y) / height) * 2.0 - 1.0,
        ];
    }


    private cameraMatrix(width: number, height: number): Float32Array {
        const cameraData = this.cameraDb.get();
        const camera = Camera.create(cameraData, width, height, 0, 0);
        return camera.getViewProjectionMatrixOrThrow();
    }


    private static toHexPos(cameraMatrix: Float32Array, point: [number, number]) {
        const invViewProjMatrix = mat3.inverse(cameraMatrix);
        const mouseWorldPos = mat3.transformPoint(invViewProjMatrix, point);
        return TilemapUtils.pixelToHex(TilemapUtils.DEFAULT_HEX_LAYOUT, [mouseWorldPos[0], mouseWorldPos[1]]);
    }

}