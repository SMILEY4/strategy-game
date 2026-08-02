import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface CameraController {
    initialize: () => void;
    dispose: () =>  void;
    update: () => void;
    onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => void;
    transformScreenToHex: (x: number, y: number) => HexPosition;
    onScroll: (delta: number, x: number, y: number) => void;
    onResize: (width: number, height: number) => void;
}
