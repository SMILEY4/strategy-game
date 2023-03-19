import {Tile} from "../models/tile";
import {GameCanvasHandle} from "../rendering/gameCanvasHandle";
import {Camera} from "../rendering/utils/camera";
import {mat3} from "../rendering/utils/mat3";
import {GameRepository} from "../required/gameRepository";
import {WorldRepository} from "../required/worldRepository";
import {TilemapUtils} from "./tilemapUtils";

export class TilePicker {

    private readonly worldRepository: WorldRepository;
    private readonly gameRepository: GameRepository;
    private readonly canvasHandle: GameCanvasHandle;


    constructor(gameRepository: GameRepository, worldRepository: WorldRepository, canvasHandle: GameCanvasHandle) {
        this.gameRepository = gameRepository;
        this.worldRepository = worldRepository;
        this.canvasHandle = canvasHandle;
    }


    public tileAt(x: number, y: number): Tile | null {
        const mouseClipPos = this.toClipSpace(x, y);
        const viewProjMatrix = this.cameraMatrix();
        const hexPos = TilePicker.toHexPos(viewProjMatrix, mouseClipPos);
        const tile = this.worldRepository.getTileAt(hexPos[0], hexPos[1]);
        return tile ? tile : null;
    }


    private toClipSpace(x: number, y: number): [number, number] {
        const canvasWidth = this.canvasHandle.getCanvas().clientWidth;
        const canvasHeight = this.canvasHandle.getCanvas().clientHeight;
        return [
            (x / canvasWidth) * 2.0 - 1.0,
            ((canvasHeight - y) / canvasHeight) * 2.0 - 1.0
        ];
    }


    private cameraMatrix(): Float32Array {
        const cameraState = this.gameRepository.getCamera();
        const camera = new Camera();
        camera.setPosition(cameraState.x, cameraState.y);
        camera.setZoom(cameraState.zoom);
        camera.updateViewProjectionMatrix(this.canvasHandle.getCanvas().width, this.canvasHandle.getCanvas().height);
        return camera.getViewProjectionMatrixOrThrow();
    }


    private static toHexPos(cameraMatrix: Float32Array, point: [number, number]) {
        const invViewProjMatrix = mat3.inverse(cameraMatrix);
        const mouseWorldPos = mat3.transformPoint(invViewProjMatrix, point);
        return TilePicker.screenToHex(TilemapUtils.DEFAULT_HEX_LAYOUT, [mouseWorldPos[0], mouseWorldPos[1]]);
    }


    private static screenToHex(layout: TilemapUtils.HexLayout, p: [number, number]): [number, number] {
        const M = layout.orientation;
        const pt = [
            (p[0] - layout.origin[0]) / layout.size[0],
            (p[1] - layout.origin[1]) / layout.size[1]
        ];
        const fq = M.b0 * pt[0] + M.b1 * pt[1];
        const fr = M.b2 * pt[0] + M.b3 * pt[1];
        const fs = -fq - fr;
        let q = Math.round(fq);
        let r = Math.round(fr);
        let s = Math.round(fs);
        const qDiff = Math.abs(q - fq);
        const rDiff = Math.abs(r - fr);
        const sDiff = Math.abs(s - fs);
        if (qDiff > rDiff && qDiff > sDiff) {
            q = -r - s;
        } else if (rDiff > sDiff) {
            r = -q - s;
        }
        return [q, r];
    }

}