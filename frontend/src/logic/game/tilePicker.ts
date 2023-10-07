import {mat3} from "../renderer/common/mat3";
import {TilemapUtils} from "../../_old_core/tilemap/tilemapUtils";
import {CameraStateAccess} from "../../state/access/CameraStateAccess";
import {Camera} from "../renderer/common/camera";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {Tile} from "../../models/tile";
import {CanvasHandle} from "./canvasHandle";

export class TilePicker {

    private readonly canvasHandle: CanvasHandle;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }

    public tileAt(x: number, y: number): Tile | null {
        const mouseClipPos = this.toClipSpace(x, y, this.canvasHandle.getClientWidth(), this.canvasHandle.getClientHeight());
        const viewProjMatrix = this.cameraMatrix(this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
        const hexPos = TilePicker.toHexPos(viewProjMatrix, mouseClipPos);
        const tile = GameStateAccess.getTileContainer().getTileAtOrNull(hexPos[0], hexPos[1]);
        return tile ? tile : null;
    }


    private toClipSpace(x: number, y: number, width: number, height: number): [number, number] {
        return [
            (x / width) * 2.0 - 1.0,
            ((height - y) / height) * 2.0 - 1.0,
        ];
    }


    private cameraMatrix(width: number, height: number): Float32Array {
        const cameraData = CameraStateAccess.getCamera();
        const camera = Camera.create(cameraData, width, height);
        return camera.getViewProjectionMatrixOrThrow();
    }


    private static toHexPos(cameraMatrix: Float32Array, point: [number, number]) {
        const invViewProjMatrix = mat3.inverse(cameraMatrix);
        const mouseWorldPos = mat3.transformPoint(invViewProjMatrix, point);
        return TilemapUtils.pixelToHex(TilemapUtils.DEFAULT_HEX_LAYOUT, [mouseWorldPos[0], mouseWorldPos[1]]);
    }


}