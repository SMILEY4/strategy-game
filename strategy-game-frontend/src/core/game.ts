import {Renderer} from "./rendering/renderer";
import {InputHandler} from "./inputHandler";
import {GameState} from "./gameState";
import {HexLayout, TilemapRenderDataBuilder} from "./rendering/tilemapRenderDataBuilder";
import {GlobalState} from "../state/globalState";
import {mat3} from "./rendering/utils/mat3";
import {DISTRIBUTOR} from "../main";
import {MarkerRenderDataBuilder} from "./rendering/markerRenderDataBuilder";

export class Game {

	public readonly input = new InputHandler();
	private readonly renderer = new Renderer();
	// private readonly renderer = new TestRenderer();
	private gameState = GameState.createInitial();


	public initialize(canvas: HTMLCanvasElement) {
		this.renderer.initialize(canvas);
	}


	public update() {

		// UPDATE STATE
		const inputState = this.input.getCurrentState();

		// move camera
		if (inputState.mouseMovement && inputState.isMouseLeftDown) {
			this.gameState.camera.move(inputState.mouseMovement.dx, inputState.mouseMovement.dy);
		}

		// zoom camera
		if (inputState.mouseScroll) {
			this.gameState.camera.doZoom(inputState.mouseScroll > 0 ? +0.1 : -0.1);
		}

		// update camera matrix
		this.gameState.camera.updateViewProjectionMatrix(this.renderer.getGL().canvas.width, this.renderer.getGL().canvas.height);

		// mouse-over tile
		if (inputState.mousePosition && inputState.canvasBounds) {
			const mouseClipPos: [number, number] = [
				(inputState.mousePosition.x / inputState.canvasBounds.width) * 2.0 - 1.0,
				((inputState.canvasBounds.height - inputState.mousePosition.y) / inputState.canvasBounds.height) * 2.0 - 1.0
			];
			const viewProjMatrix = this.gameState.camera.getViewProjectionMatrixOrThrow();
			const invViewProjMatrix = mat3.inverse(viewProjMatrix);
			const mouseWorldPos = mat3.transformPoint(invViewProjMatrix, mouseClipPos);
			const hexPos = Game.screenToHex(TilemapRenderDataBuilder.DEFAULT_HEX_LAYOUT, [mouseWorldPos[0], mouseWorldPos[1]]);
			const mouseOverTile = GlobalState.useState.getState().map.find(t => t.q === hexPos[0] && t.r === hexPos[1]);
			if (mouseOverTile) {
				this.gameState.tileMouseOver = [mouseOverTile.q, mouseOverTile.r];
			}
		}

		// place marker
		if (inputState.isMouseClick && this.gameState.tileMouseOver) {
			if (GlobalState.useState.getState().turnState === "active") {
				DISTRIBUTOR.placeMarker(this.gameState.tileMouseOver[0], this.gameState.tileMouseOver[1]);
			}
		}

		// rebuild dirty tilemap
		if (this.gameState.tilemapDirty) {
			this.gameState.tilemap = TilemapRenderDataBuilder.build(GlobalState.useState.getState().map, this.renderer.getGL());
			this.gameState.tilemapDirty = false;
		}

		// rebuild dirty markers
		if (this.gameState.markersDirty) {
			this.gameState.markers = MarkerRenderDataBuilder.build(GlobalState.useState.getState().playerMarkers, GlobalState.useState.getState().playerCommands, this.renderer.getGL());
			this.gameState.markersDirty = false;
		}

		// RENDER STATE
		this.renderer.render(this.gameState);

		// RESET STATE
		this.input.reset();
	}


	public dispose() {
		this.renderer.dispose();
		this.gameState = GameState.createInitial();
	}


	public setTilemapDirty() {
		this.gameState.tilemapDirty = true;
	}

	public setMarkersDirty() {
		this.gameState.markersDirty = true;
	}


	private static screenToHex(layout: HexLayout, p: [number, number]): [number, number] {
		const M = layout.orientation;
		const pt = [
			(p[0] - layout.origin[0]) / layout.size[0],
			(p[1] - layout.origin[1]) / layout.size[1]
		];
		const fq = M.b0 * pt[0] + M.b1 * pt[1];
		const fr = M.b2 * pt[0] + M.b3 * pt[1];
		const fs = -fq - fr;
		// round to fractional (fq,fr) to nearest hex (q,r)
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
