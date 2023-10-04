import {GameRenderer} from "../renderer/gameRenderer";
import {CameraStateAccess} from "../../state/access/CameraStateAccess";

export class GameLoopService {

    private readonly renderer: GameRenderer;

    constructor(renderer: GameRenderer) {
        this.renderer = renderer;
    }


    initialize(canvas: HTMLCanvasElement) {
        console.log("init renderer");
        this.renderer.initialize(canvas);
    }

    onGameStateUpdate() {
        console.log("game state update");
        this.renderer.updateWorld();
    }

    update() {
        this.renderer.render();
    }

    dispose() {
        this.renderer.dispose();
    }

    mouseClick(x: number, y: number) {
    }

    mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
        if (leftBtnDown) {
            const camera = CameraStateAccess.getCamera();
            CameraStateAccess.setCamera({
                x: camera.x + dx / camera.zoom,
                y: camera.y - dy / camera.zoom,
                zoom: camera.zoom,
            });
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