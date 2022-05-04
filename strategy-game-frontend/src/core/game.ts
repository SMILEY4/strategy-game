import {GameLifecycle} from "./ports/provided/gameLifecycle";
import {GameLifecycleService} from "./service/gameLifecycleService";
import {InputHandler} from "./ports/provided/inputHandler";
import {InputService} from "./service/inputService";
import {WorldHandler} from "./ports/provided/worldHandler";
import {WorldService} from "./service/worldService";
import {TurnHandler} from "./ports/provided/turnHandler";
import {TurnService} from "./service/turnService";
import {StateProvider} from "./ports/required/stateProvider";
import {StateProviderImpl} from "../state/stateProviderImpl";
import {GameCanvas} from "./service/gameCanvas";
import {Renderer} from "./service/rendering/renderer";
import {TilePicker} from "./service/tilemap/tilePicker";
import {ApiClientImpl} from "../api/apiClientImpl";
import {ApiClient} from "./ports/required/apiClient";
import {AuthProvider} from "./ports/provided/authProvider";
import {AuthProviderImpl} from "./service/AuthProviderImpl";

export namespace Game {

	const stateProvider: StateProvider = new StateProviderImpl();
	const gameCanvas: GameCanvas = new GameCanvas();
	const renderer: Renderer = new Renderer(gameCanvas, stateProvider);
	const tilePicker: TilePicker = new TilePicker(stateProvider, gameCanvas);
	const authProvider: AuthProvider = new AuthProviderImpl();

	export const client: ApiClient = new ApiClientImpl(authProvider);
	export const lifecycle: GameLifecycle = new GameLifecycleService(gameCanvas, renderer);
	export const input: InputHandler = new InputService(stateProvider, tilePicker);
	export const world: WorldHandler = new WorldService(stateProvider, client);
	export const turn: TurnHandler = new TurnService(stateProvider, client);

	export function debugLooseWebglContext() {
		if(gameCanvas.getGL()) {
			const ext = gameCanvas.getGL().getExtension('WEBGL_lose_context');
			if(ext) {
				console.log("LOOSING CONTEXT")
				ext.loseContext()
			}
		}
	}

}