import {GameRenderer} from "../renderer/gameRenderer";
import {GameRepository} from "./gameRepository";

export class GameLoopService {

    private readonly renderer: GameRenderer;
    private readonly gameRepository: GameRepository;

    constructor(renderer: GameRenderer, gameRepository: GameRepository) {
        this.renderer = renderer;
        this.gameRepository = gameRepository;
    }


    initialize(canvas: HTMLCanvasElement) {
        this.renderer.initialize(canvas);
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
    }

    mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
        if (leftBtnDown) {
            const camera = this.gameRepository.getCamera();
            this.gameRepository.setCamera({
                x: camera.x + dx / camera.zoom,
                y: camera.y - dy / camera.zoom,
                zoom: camera.zoom,
            });
        }
    }

    mouseScroll(d: number) {
        const camera = this.gameRepository.getCamera();
        const dz = d > 0 ? 0.1 : -0.1;
        const zoom = Math.max(0.01, camera.zoom - dz);
        this.gameRepository.setCamera({
            x: camera.x,
            y: camera.y,
            zoom: zoom,
        });
    }

}