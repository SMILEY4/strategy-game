import {LocalGameStateAccess} from "../external/state/localgame/localGameStateAccess";

/**
 * Handles a mouse-scroll
 */
export class InputMouseScrollAction {

    private readonly gameStateAccess: LocalGameStateAccess;

    constructor(gameStateAccess: LocalGameStateAccess) {
        this.gameStateAccess = gameStateAccess;
    }

    perform(d: number): void {
        const dz = d > 0 ? 0.1 : -0.1;
        const camera = this.gameStateAccess.getCamera();
        const zoom = Math.max(0.01, camera.zoom - dz);
        this.gameStateAccess.setCameraZoom(zoom);
    }

}