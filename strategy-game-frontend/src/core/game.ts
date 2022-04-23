import {Renderer} from "./rendering/renderer";
import {InputHandler} from "./inputHandler";
import {GameState} from "./gameState";
import {GlobalState} from "../state/globalState";
import {mat3} from "./rendering/utils/mat3";
import {DISTRIBUTOR} from "../main";
import {HexLayout, TilemapRenderer} from "./rendering/tilemap/TilemapRenderer";

export class Game {

	public readonly input = new InputHandler();
	private readonly renderer = new Renderer();
	private canvas: HTMLCanvasElement = null as any;
	private gameState = GameState.createInitial();


	public initialize(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
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
		this.gameState.camera.updateViewProjectionMatrix(this.canvas.width, this.canvas.height);

		// mouse-over tile
		if (inputState.mousePosition && inputState.canvasBounds) {
			const mouseClipPos: [number, number] = [
				(inputState.mousePosition.x / inputState.canvasBounds.width) * 2.0 - 1.0,
				((inputState.canvasBounds.height - inputState.mousePosition.y) / inputState.canvasBounds.height) * 2.0 - 1.0
			];
			const viewProjMatrix = this.gameState.camera.getViewProjectionMatrixOrThrow();
			const invViewProjMatrix = mat3.inverse(viewProjMatrix);
			const mouseWorldPos = mat3.transformPoint(invViewProjMatrix, mouseClipPos);
			const hexPos = Game.screenToHex(TilemapRenderer.DEFAULT_HEX_LAYOUT, [mouseWorldPos[0], mouseWorldPos[1]]);
			const mouseOverTile = GlobalState.useState.getState().map.find(t => t.q === hexPos[0] && t.r === hexPos[1]);
			if (mouseOverTile) {
				this.gameState.tileMouseOver = [mouseOverTile.q, mouseOverTile.r];
			} else {
				this.gameState.tileMouseOver = null;
			}
		}

		// place marker
		if (inputState.isMouseClick && this.gameState.tileMouseOver) {
			if (GlobalState.useState.getState().turnState === "active") {
				DISTRIBUTOR.placeMarker(this.gameState.tileMouseOver[0], this.gameState.tileMouseOver[1]);
			}
		}

		// RENDER STATE
		this.renderer.render(GlobalState.useState.getState(), this.gameState.camera, this.gameState.tileMouseOver ? this.gameState.tileMouseOver : [100000, 100000]);

		// RESET INPUT-STATE
		this.input.reset();
	}


	public dispose() {
		this.renderer.dispose();
		this.gameState = GameState.createInitial();
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
