import {CameraStateAccess} from "../../state/access/CameraStateAccess";

export class CanvasHandle {

    private canvas: HTMLCanvasElement | null = null;
    private gl: WebGL2RenderingContext | null = null;


    public set(canvas: HTMLCanvasElement | null): void {
        this.canvas = canvas;
        if (canvas) {
            const gl = canvas.getContext("webgl2");
            if (!gl) {
                throw Error("webgl2 not supported");
            }
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl = gl;
        } else {
            this.gl = null;
        }
    }

    public getGL(): WebGL2RenderingContext {
        if (this.gl) {
            return this.gl;
        } else {
            throw new Error("Cant get webgl-context: is null");
        }
    }

    public getCanvas(): HTMLCanvasElement {
        if (this.canvas) {
            return this.canvas;
        } else {
            throw new Error("Cant get canvas: is null");
        }
    }


    public getCanvasWidth(): number {
        return this.getCanvas().width
    }

    public getCanvasHeight(): number {
        return this.getCanvas().height
    }

    public getClientWidth(): number {
        return this.getCanvas().clientWidth
    }

    public getClientHeight(): number {
        return this.getCanvas().clientHeight
    }

}