export interface CameraController {
    initialize: () => void;
    dispose: () =>  void;
    update: () => void;
    onMouseMove: (mx: number, my: number, buttons: number) => void;
    onCanvasClick: (x: number, y: number) => void;
    onResize: (width: number, height: number) => void;
}
