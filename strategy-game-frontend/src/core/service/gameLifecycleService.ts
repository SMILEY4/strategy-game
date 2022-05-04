import {GameLifecycle} from "../ports/provided/gameLifecycle";
import {GameCanvas} from "./gameCanvas";
import {Renderer} from "./rendering/renderer";

export class GameLifecycleService implements GameLifecycle {

	private readonly gameCanvas: GameCanvas;
	private readonly renderer: Renderer;


	constructor(gameCanvas: GameCanvas, renderer: Renderer) {
		this.gameCanvas = gameCanvas;
		this.renderer = renderer;
	}


	public initialize(canvas: HTMLCanvasElement): void {
		this.gameCanvas.set(canvas);
		this.renderer.initialize();
	}


	public update(): void {
		try {
		this.renderer.render();
		} catch (e) {

		}
	}


	public dispose(): void {
		this.gameCanvas.set(null);
		this.renderer.dispose();
	}

}