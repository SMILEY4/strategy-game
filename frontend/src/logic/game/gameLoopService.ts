import {GameRenderer} from "../renderer/gameRenderer";
import {CameraStateAccess} from "../../state/access/CameraStateAccess";
import {TilePicker} from "./tilePicker";
import {CanvasHandle} from "./canvasHandle";
import {GameStateAccess} from "../../state/access/GameStateAccess";

export class GameLoopService {

    private canvasHandle: CanvasHandle;
    private readonly renderer: GameRenderer;
    private readonly tilePicker;

    constructor(canvasHandle: CanvasHandle, renderer: GameRenderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
        this.tilePicker = new TilePicker(canvasHandle);
    }

    initialize(canvas: HTMLCanvasElement) {
        this.canvasHandle.set(canvas);
        this.renderer.initialize();
    }

    onGameStateUpdate() {
        this.renderer.updateWorld();
    }

    update() {
        this.renderer.render();
    }

    dispose() {
        this.renderer.dispose();
    }

    mouseClick(x: number, y: number) {
        const tile = this.tilePicker.tileAt(x, y);
        GameStateAccess.setSelectedTile(tile?.identifier || null);
    }

    mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
        if (leftBtnDown) {
            const camera = CameraStateAccess.getCamera();
            CameraStateAccess.setCamera({
                x: camera.x + dx / camera.zoom,
                y: camera.y - dy / camera.zoom,
                zoom: camera.zoom,
            });
        } else {
            const tile = this.tilePicker.tileAt(x, y);
            if (tile?.identifier.id !== GameStateAccess.getHoverTile()?.id) {
                GameStateAccess.setHoverTile(tile?.identifier || null);
            }
        }
    }

    mouseScroll(d: number) {
        const camera = CameraStateAccess.getCamera();
        const dz = d > 0 ? 0.1 : -0.1;
        const zoom = Math.max(0.01, camera.zoom - dz);
        CameraStateAccess.setCamera({
            x: camera.x,
            y: camera.y,
            zoom: zoom,
        });
    }

}