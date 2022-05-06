import {GameCanvas} from "../gameCanvas";
import {TilemapRenderer} from "./tilemap/TilemapRenderer";
import {StateProvider} from "../../ports/required/stateProvider";
import {Camera} from "./utils/camera";
import {MarkerRenderer} from "./markers/markerRenderer";

export class Renderer {

	private readonly gameCanvas: GameCanvas;
	private readonly stateProvider: StateProvider;
	private readonly tilemapRenderer: TilemapRenderer;
	private readonly markerRenderer: MarkerRenderer;

	constructor(gameCanvas: GameCanvas, stateProvider: StateProvider) {
		this.gameCanvas = gameCanvas;
		this.stateProvider = stateProvider;
		this.tilemapRenderer = new TilemapRenderer(gameCanvas);
		this.markerRenderer = new MarkerRenderer(gameCanvas);
	}


	public initialize(): void {
		this.tilemapRenderer.initialize();
		this.markerRenderer.initialize();
	}


	public render(): void {
		const gl = this.gameCanvas.getGL();
		this.checkErrors(gl)

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const camera = this.createCamera();

		const map = this.stateProvider.getState().map;
		const tileMouseOver = this.stateProvider.getState().tileMouseOver;
		this.tilemapRenderer.render(camera, map, tileMouseOver ? tileMouseOver : [9999, 9999]);

		this.markerRenderer.render(camera, this.stateProvider.getState().playerMarkers, this.stateProvider.getState().playerCommands);
	}


	private checkErrors(gl: WebGL2RenderingContext) {
		const error = gl.getError();
		if(error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) {
			alert("fail")
		}
	}

	private createCamera(): Camera {
		const camState = this.stateProvider.getState().camera;
		const camera = new Camera();
		camera.setPosition(camState.x, camState.y);
		camera.setZoom(camState.zoom);
		camera.updateViewProjectionMatrix(this.gameCanvas.getCanvas().width, this.gameCanvas.getCanvas().height);
		return camera;
	}


	public dispose(): void {
		this.tilemapRenderer.dispose();
		this.markerRenderer.dispose();
	}

}