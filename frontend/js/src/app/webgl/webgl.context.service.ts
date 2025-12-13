import {App} from "../../appContext";
import {GameProxyImpl} from "../../logic/game/gameProxy";

export const WebglContextService = {

    loose() {
        (App.gameProxy as GameProxyImpl).canvasHandle.debugLooseWebglContext();
    },

    restore() {
        (App.gameProxy as GameProxyImpl).canvasHandle.debugRestoreWebglContext();
    },

};