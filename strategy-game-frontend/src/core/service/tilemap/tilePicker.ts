import {GlobalState} from "../../../state/globalState";
import {StateProvider} from "../../ports/required/stateProvider";
import Tile = GlobalState.Tile;
import {GameCanvas} from "../gameCanvas";
import {mat3} from "../rendering/utils/mat3";
import {TilemapUtils} from "./tilemapUtils";
import {Camera} from "../rendering/utils/camera";

export class TilePicker {

	private readonly stateProvider: StateProvider;
	private readonly gameCanvas: GameCanvas;

	constructor(stateProvider: StateProvider, gameCanvas: GameCanvas) {
		this.stateProvider = stateProvider;
		this.gameCanvas = gameCanvas;
	}

	public tileAt(x: number, y: number): Tile | null {
		const mouseClipPos = this.toClipSpace(x, y);
		const viewProjMatrix = this.cameraMatrix();
		const hexPos = this.toHexPos(viewProjMatrix, mouseClipPos);
		const tile = this.stateProvider.getState().map.find(t => t.q === hexPos[0] && t.r === hexPos[1]);
		return tile ? tile : null;
	}


	private toClipSpace(x: number, y: number): [number, number] {
		const canvasWidth = this.gameCanvas.getCanvas().clientWidth;
		const canvasHeight = this.gameCanvas.getCanvas().clientHeight;
		return [
			(x / canvasWidth) * 2.0 - 1.0,
			((canvasHeight - y) / canvasHeight) * 2.0 - 1.0
		];
	}

	private cameraMatrix(): Float32Array {
		const camera = new Camera();
		camera.setPosition(GlobalState.useState.getState().camera.x, GlobalState.useState.getState().camera.y);
		camera.setZoom(GlobalState.useState.getState().camera.zoom);
		camera.updateViewProjectionMatrix(this.gameCanvas.getCanvas().width, this.gameCanvas.getCanvas().height);
		return camera.getViewProjectionMatrixOrThrow();
	}

	private toHexPos(cameraMatrix: Float32Array, point: [number, number]) {
		const invViewProjMatrix = mat3.inverse(cameraMatrix);
		const mouseWorldPos = mat3.transformPoint(invViewProjMatrix, point);
		return TilePicker.screenToHex(TilemapUtils.DEFAULT_HEX_LAYOUT, [mouseWorldPos[0], mouseWorldPos[1]]);
	}


	private static screenToHex(layout: TilemapUtils.HexLayout, p: [number, number]): [number, number] {
		const M = layout.orientation;
		const pt = [
			(p[0] - layout.origin[0]) / layout.size[0],
			(p[1] - layout.origin[1]) / layout.size[1]
		];
		const fq = M.b0 * pt[0] + M.b1 * pt[1];
		const fr = M.b2 * pt[0] + M.b3 * pt[1];
		const fs = -fq - fr;
		let q = Math.round(fq);
		let r = Math.round(fr);
		let s = Math.round(fs);
		const qDiff = Math.abs(q - fq);
		const rDiff = Math.abs(r - fr);
		const sDiff = Math.abs(s - fs);
		if (qDiff > rDiff && qDiff > sDiff) {
			q = -r - s;
		} else if (rDiff > sDiff) {
			r = -q - s;
		}
		return [q, r];
	}

}