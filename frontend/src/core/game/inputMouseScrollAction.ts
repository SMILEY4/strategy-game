import {GameRepository} from "../required/gameRepository";

/**
 * Handles a mouse-scroll
 */
export class InputMouseScrollAction {

    private readonly gameRepository: GameRepository;

    constructor(gameRepository: GameRepository) {
        this.gameRepository = gameRepository;
    }

    perform(d: number): void {
        const dz = d > 0 ? 0.1 : -0.1;
        const camera = this.gameRepository.getCamera();
        const zoom = Math.max(0.01, camera.zoom - dz);
        this.gameRepository.setCameraZoom(zoom);
    }

}