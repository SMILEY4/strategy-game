import {RenderModule} from "../renderModule";
import {Camera} from "../../shared/webgl/camera";
import {RenderData} from "../data/renderData";
import {TileIdentifier} from "../../models/tile";
import {TilemapUtils} from "../../logic/game/tilemapUtils";
import {mat3} from "../../shared/webgl/mat3";
import {MapMode} from "../../models/mapMode";
import {TileRepository} from "../../state/access/TileRepository";

export class LabelRenderer implements RenderModule {

    private static readonly LABEL_OFFSET: [number, number] = [0, -TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.7]
    private static readonly ICON_OFFSET: [number, number] = [0, 0]

    private readonly tileRepository: TileRepository;

    private containerElement: HTMLElement | null = null;
    private lastCameraHash = -99999;

    constructor(tileRepository: TileRepository) {
        this.tileRepository = tileRepository;
    }

    public initialize(): void {
        this.containerElement = document.getElementById("game-canvas-overlay");
    }


    public dispose(): void {
    }


    public render(camera: Camera, data: RenderData): void {
        const currentCameraHash = this.cameraHash(camera);
        if (this.containerElement && currentCameraHash !== this.lastCameraHash) {
            this.lastCameraHash = currentCameraHash;

            const canvasSize = this.getCanvasSize();

            this.clear();

            for (let i = 0, n = data.entities.items.length; i < n; i++) {
                const entity = data.entities.items[i];
                if (entity.label) {
                    const pos = this.getAbsolutePosition(entity.tile, camera, canvasSize, LabelRenderer.LABEL_OFFSET);
                    if (this.isVisible(pos, canvasSize)) {
                        const element = this.createLabelElement(pos, entity.label);
                        this.containerElement.appendChild(element);
                    }
                }
            }

            if (data.meta.mapMode === MapMode.RESOURCES && camera.getZoom() > 2) {
                const tiles = this.tileRepository.getTiles();
                for (let i = 0, n = tiles.length; i < n; i++) {
                    const tile = tiles[i];
                    if (tile.resourceType !== null) {
                        const pos = this.getAbsolutePosition(tile.identifier, camera, canvasSize, LabelRenderer.ICON_OFFSET);
                        if (this.isVisible(pos, canvasSize)) {
                            const element = this.createIconElement(pos, tile.resourceType.icon);
                            this.containerElement.appendChild(element);
                        }
                    }
                }
            }

        }
    }

    private cameraHash(camera: Camera): number {
        return camera.getWidth() + camera.getHeight() + camera.getX() + camera.getY() + camera.getZoom();
    }

    private getCanvasSize(): [number, number] {
        return [
            this.containerElement!.clientWidth,
            this.containerElement!.clientHeight,
        ];
    }

    private clear() {
        this.containerElement?.replaceChildren();
    }

    private getAbsolutePosition(tile: TileIdentifier, camera: Camera, canvasSize: [number, number], offset: [number, number]): [number, number] {
        let worldPos = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
        worldPos = [worldPos[0] + offset[0], worldPos[1] + offset[1]];

        const matrix = camera.getViewProjectionMatrixOrThrow();
        const viewPos = mat3.transformPoint(matrix, worldPos);

        return [
            (viewPos[0] + 1.0) / 2 * canvasSize[0],
            canvasSize[1] - (viewPos[1] + 1.0) / 2 * canvasSize[1],
        ];
    }

    private isVisible(pos: [number, number], canvasSize: [number, number]): boolean {
        const padding = 100;
        return (-padding <= pos[0] && pos[0] <= canvasSize[0]+padding)
            && (-padding <= pos[1] && pos[1] <= canvasSize[1]+padding);
    }

    private createLabelElement(pos: [number, number], label: string): HTMLElement {
        const element = document.createElement("div");
        element.textContent = label;
        element.className = "world-ui__label";
        element.style.left = pos[0] + "px";
        element.style.top = pos[1] + "px";
        return element;
    }


    private createIconElement(pos: [number, number], icon: string): HTMLElement {
        const element = document.createElement("div");
        element.className = "world-ui__icon";
        element.style.left = pos[0] + "px";
        element.style.top = pos[1] + "px";
        element.style.backgroundImage = "url('" + icon + "')"
        return element;
    }

}