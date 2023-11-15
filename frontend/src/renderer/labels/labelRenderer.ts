import {RenderModule} from "../renderModule";
import {Camera} from "../../shared/webgl/camera";
import {RenderData} from "../data/renderData";
import {TileIdentifier} from "../../models/tile";
import {TilemapUtils} from "../../logic/game/tilemapUtils";
import {mat3} from "../../shared/webgl/mat3";

export class LabelRenderer implements RenderModule {

    private containerElement: HTMLElement | null = null;

    private lastCameraHash = -99999;


    public initialize(): void {
        this.containerElement = document.getElementById("game-canvas-overlay");
    }


    public dispose(): void {
    }


    public render(camera: Camera, data: RenderData): void {
        const currentCameraHash = this.cameraHash(camera)
        if (this.containerElement && currentCameraHash !== this.lastCameraHash) {
            this.lastCameraHash = currentCameraHash;

            const canvasSize = [
                this.containerElement!.clientWidth,
                this.containerElement!.clientHeight,
            ] as [number, number];

            this.containerElement.replaceChildren();

            for (let i = 0, n = data.entities.items.length; i < n; i++) {
                const entity = data.entities.items[i];
                if (entity.label) {
                    const pos = this.getAbsolutePosition(entity.tile, camera, canvasSize);
                    const element = this.createElement(pos, entity.label);
                    this.containerElement.appendChild(element);
                }
            }

        }
    }

    private cameraHash(camera: Camera): number {
        return camera.getWidth() + camera.getHeight() + camera.getX() + camera.getY() + camera.getZoom()
    }

    private getAbsolutePosition(tile: TileIdentifier, camera: Camera, canvasSize: [number, number]): [number, number] {
        let worldPos = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
        worldPos = [worldPos[0], worldPos[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.7];

        const matrix = camera.getViewProjectionMatrixOrThrow();
        const viewPos = mat3.transformPoint(matrix, worldPos);

        return [
            (viewPos[0] + 1.0) / 2 * canvasSize[0],
            canvasSize[1] - (viewPos[1] + 1.0) / 2 * canvasSize[1],
        ];
    }

    private createElement(pos: [number, number], label: string): HTMLElement {
        const element = document.createElement("div");
        element.textContent = label;
        element.className = "world-ui__label";
        element.style.left = pos[0] + "px";
        element.style.top = pos[1] + "px";
        return element;
    }

}