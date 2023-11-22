import {mat3} from "./mat3";
import {CameraData} from "../../models/cameraData";

export class Camera {

    private x = 0;
    private y = 0;
    private width = 0;
    private height = 0;
    private zoom = 1;
    private viewProjectionMatrix: Float32Array | null = null;

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }


    public setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public move(dx: number, dy: number): void {
        this.x += (dx * 2) / this.zoom;
        this.y -= (dy * 2) / this.zoom;
    }

    public setZoom(zoom: number): void {
        this.zoom = zoom;
    }

    public doZoom(dZoom: number) {
        this.zoom = Math.max(0.01, this.zoom - dZoom);
    }


    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getZoom(): number {
        return this.zoom;
    }

    public updateViewProjectionMatrix() {
        const mat = mat3.identity();
        mat3.scale(mat, 1 / (this.width / 2), 1 / (this.height / 2), mat);
        mat3.scale(mat, this.zoom, this.zoom, mat);
        mat3.translate(mat, this.x, this.y, mat);
        this.viewProjectionMatrix = mat;
    }

    public getViewProjectionMatrix(calculateIfNotExists?: boolean): Float32Array | null {
        if (calculateIfNotExists === true && !this.viewProjectionMatrix) {
            this.updateViewProjectionMatrix();
        }
        return this.viewProjectionMatrix;
    }

    public getViewProjectionMatrixOrThrow(calculateIfNotExists?: boolean): Float32Array {
        const matrix = this.getViewProjectionMatrix(calculateIfNotExists);
        if (!matrix) {
            throw new Error("Camera view-projection-matrix does not exist.");
        } else {
            return matrix;
        }
    }

}

export namespace Camera {

    export function create(cameraData: CameraData, width: number, height: number): Camera {
        const camera = new Camera();
        camera.setPosition(cameraData.x, cameraData.y);
        camera.setSize(width, height)
        camera.setZoom(cameraData.zoom);
        camera.updateViewProjectionMatrix();
        return camera;
    }

}