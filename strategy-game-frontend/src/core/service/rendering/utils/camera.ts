import {mat3} from "./mat3";

export class Camera {

	private x = 0;
	private y = 0;
	private zoom = 1;
	private viewProjectionMatrix: Float32Array | null = null;

	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
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

	public getZoom(): number {
		return this.zoom;
	}

	public updateViewProjectionMatrix(width: number, height: number) {
		const mat = mat3.identity();
		mat3.scale(mat, 1 / (width / 2), 1 / (height / 2), mat);
		mat3.scale(mat, this.zoom, this.zoom, mat);
		mat3.translate(mat, this.x, this.y, mat);
		this.viewProjectionMatrix = mat;
	}

	public getViewProjectionMatrix(calculateIfNotExists?: boolean, width?: number, height?: number): Float32Array | null {
		if (calculateIfNotExists === true && !this.viewProjectionMatrix && width && height) {
			this.updateViewProjectionMatrix(width, height);
		}
		return this.viewProjectionMatrix;
	}

	public getViewProjectionMatrixOrThrow(calculateIfNotExists?: boolean, width?: number, height?: number): Float32Array {
		const matrix = this.getViewProjectionMatrix(calculateIfNotExists, width, height);
		if (!matrix) {
			throw new Error("Camera view-projection-matrix does not exist.");
		} else {
			console.log(matrix)
			return matrix;
		}
	}


}