import {App} from "../../appContext";

export const GameService = {

    initialize(canvas: HTMLCanvasElement) {
        App.gameProxy.initialize(canvas);
    },

    dispose() {
        App.gameProxy.dispose();
    },

    update() {
        App.gameProxy.update();
    },

    mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean) {
        App.gameProxy.mouseMoved(dx, dy, clientX, clientY, leftBtnDown );
    },

    mouseScrolled(d: number, clientX: number, clientY: number) {
        App.gameProxy.mouseScrolled(d, clientX, clientY);
    },

    mouseClicked(clientX: number, clientY: number) {
        App.gameProxy.mouseClicked(clientX, clientY);
    },

}