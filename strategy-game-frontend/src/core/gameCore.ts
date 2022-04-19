import {InputHandler} from "./input/inputHandler";

export class GameCore {

	public readonly input = new InputHandler();

	public initialize(gameCanvas: HTMLCanvasElement) {
	}

	public update() {
		// todo: render
		this.input.reset();
	}

	public dispose() {
	}

}
