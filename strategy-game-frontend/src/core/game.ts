import {Renderer} from "./rendering/renderer";
import {InputHandler} from "./inputHandler";
import {GameState} from "./gameState";
import {TilemapRenderDataBuilder} from "./rendering/tilemapRenderDataBuilder";
import {GlobalState} from "../state/globalState";

export class Game {

	public readonly input = new InputHandler();
	private readonly renderer = new Renderer();
	private gameState = GameState.createInitial();


	public initialize(canvas: HTMLCanvasElement) {
		this.renderer.initialize(canvas);
	}


	public update() {

		// update state
		const inputState = this.input.getCurrentState();
		if(inputState.mouseMovement && inputState.isMouseLeftDown) {
			this.gameState.camera.move(inputState.mouseMovement.dx, inputState.mouseMovement.dy)
		}
		if(inputState.mouseScroll) {
			this.gameState.camera.doZoom(inputState.mouseScroll > 0 ? +0.1 : -0.1)
		}
		if(this.gameState.tilemapDirty) {
			this.gameState.tilemap = TilemapRenderDataBuilder.build(GlobalState.useState.getState().map, this.renderer.getGL())
			this.gameState.tilemapDirty = false;
		}

		// render
		this.renderer.render(this.gameState);

		// reset
		this.input.reset();
	}


	public dispose() {
		this.renderer.dispose();
		this.gameState = GameState.createInitial();
	}


	public setTilemapDirty() {
		this.gameState.tilemapDirty = true;
	}

}
