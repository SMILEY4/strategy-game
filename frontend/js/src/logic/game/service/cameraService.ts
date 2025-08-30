import {GameStateWriter} from "../../../state/gameStateWriter";
import {Projections} from "../../../common/webgl/projections";
import {TilePosition} from "../../../models/tile/tilePosition";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Camera} from "../../../common/webgl/camera";

export interface CameraService {
	/**
	 * Set the camera position to center on the given tile
	 */
	centerOnTile(tile: TilePosition): void;
	/**
	 * Move the camera by the given x and y distance
	 */
	move(dx: number, dy: number, canvasHandle: CanvasHandle): void;
	/**
	 * Zoom the camera by the given direction
	 */
	zoom(d: "in" | "out"): void;
	/**
	 * Zoom the camera by the given direction at the given screen coordinates
	 */
	zoomAt(x: number, y: number, d: "in" | "out", canvasHandle: CanvasHandle): void;
}

export class CameraServiceImpl implements CameraService {

	private static readonly ZOOM_FACTOR = 1.05;
	private static readonly ZOOM_MIN = 0.5;
	private static readonly ZOOM_MAX = 150;


	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(localStateAccess: GameStateAccess, gameStateWriter: GameStateWriter) {
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}

	centerOnTile(tile: TilePosition): void {
		const pos = Projections.hexToWorld(tile.q, tile.r);
		const camera = this.localStateAccess.getCamera();
		this.gameStateWriter.setCameraData({
			x: -pos.x,
			y: -pos.y,
			zoom: camera.zoom,
		});
	}

	move(dx: number, dy: number, canvasHandle: CanvasHandle): void {
		// get current camera & create a camera clone looking at world (0,0)
		const cameraData = this.localStateAccess.getCamera();
		const cameraOrigin = Camera.create(
			{
				...cameraData,
				x: 0,
				y: 0,
			},
			canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
		);

		// project mouse movement distance on screen to world
		// Note: camera looking at origin, i.e. (0,0) is in middle of screen. Need to offset screen coords accordingly
		const dScreen = Projections.screenToWorld(
			cameraOrigin,
			dx + canvasHandle.getClientWidth() / 2,
			dy + canvasHandle.getClientHeight() / 2,
		);

		this.gameStateWriter.setCameraData({
			x: cameraData.x + dScreen.x,
			y: cameraData.y + dScreen.y,
			zoom: cameraData.zoom,
		});
	}

	zoom(d: "in" | "out"): void {
		const cameraData = this.localStateAccess.getCamera();
		this.gameStateWriter.setCameraData({
			x: cameraData.x,
			y: cameraData.y,
			zoom: this.calculateZoom(cameraData.zoom, d),
		});
	}

	zoomAt(x: number, y: number, d: "in" | "out", canvasHandle: CanvasHandle): void {

		// get current camera
		const cameraData = this.localStateAccess.getCamera();

		// zoom in (on center)
		const cameraDataZoomed = {
			x: cameraData.x,
			y: cameraData.y,
			zoom: this.calculateZoom(cameraData.zoom, d),
		};

		// get world position of given screen position before zoom
		const worldPosBefore = Projections.screenToWorld(
			Camera.create(
				cameraData,
				canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
				canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
			),
			x, y,
		);

		// get world position of given screen position after zoom
		const worldPosAfter = Projections.screenToWorld(
			Camera.create(
				cameraDataZoomed,
				canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
				canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
			),
			x, y,
		);

		// translate camera to keep given screen position in center
		cameraDataZoomed.x = cameraDataZoomed.x + (worldPosAfter.x - worldPosBefore.x);
		cameraDataZoomed.y = cameraDataZoomed.y + (worldPosAfter.y - worldPosBefore.y);

		// set new camera
		this.gameStateWriter.setCameraData(cameraDataZoomed);

	}

	private calculateZoom(currentZoom: number, direction: "in" | "out"): number {
		const zoom =  (direction == "in")
			? currentZoom * CameraServiceImpl.ZOOM_FACTOR
			: currentZoom / CameraServiceImpl.ZOOM_FACTOR
		return Math.max(CameraServiceImpl.ZOOM_MIN, Math.min(zoom, CameraServiceImpl.ZOOM_MAX));
	}
}