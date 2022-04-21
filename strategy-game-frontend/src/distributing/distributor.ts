import {GlobalState} from "../state/globalState";
import {Game} from "../core/game";
import {ApiClient, WorldMeta} from "../api/apiClient";

export class Distributor {

	private readonly client = new ApiClient();
	private readonly gameCore = new Game();

	//====================//
	//   WORLD HANDLING   //
	//====================//

	/**
	 * Create a new world.
	 * @return information about the created world
	 */
	public requestCreateWorld(): Promise<WorldMeta> {
		return this.client.createWorld();
	}


	/**
	 * Join the world with the given id
	 * @param worldId the id of the world to join
	 * @param playerName the name of the player
	 * @param navigate a function to navigate to a provided url
	 */
	public requestJoinWorld(worldId: string, playerName: string, navigate: (url: string) => void): Promise<void> {
		return this.client.openWorldConnection()
			.then(() => GlobalState.useState.getState().setLoading(worldId))
			.then(() => this.client.sendJoinWorld(worldId, playerName))
			.then(() => navigate("/game"));
	}


	/**
	 * Set the initial world state to the given state
	 * @param state the initial state
	 */
	public setInitialWorldState(state: any) {
		GlobalState.useState.getState().setActive(state.map.tiles);
		this.gameCore.setTilemapDirty();
	}


	/**
	 * Place a marker at the given tile-position
	 */
	public placeMarker(q: number, r: number) {
		GlobalState.useState.getState().addCommandPlaceMarker(q, r);
		this.gameCore.setMarkersDirty();
	}

	/**
	 * Submit all commands and end the current turn
	 */
	public submitTurn() {
		GlobalState.useState.getState().setTurnState("submitted");
		this.client.submitTurn(GlobalState.useState.getState().worldId as string, GlobalState.useState.getState().playerCommands);
	}

	/**
	 * Apply the given changes and start the next turn
	 */
	public startNewTurn(addedMarkers: GlobalState.PlayerMarker[]) {
		GlobalState.useState.getState().addMarkers(addedMarkers);
		GlobalState.useState.getState().setTurnState("active");
		GlobalState.useState.getState().clearCommands();
		this.gameCore.setMarkersDirty();
	}


	//====================//
	//   GAME LIFECYCLE   //
	//====================//

	/**
	 * Initialize the game core
	 */
	public gameInitialize(canvas: HTMLCanvasElement) {
		this.gameCore.initialize(canvas);
	}

	/**
	 * Destroy the game core
	 */
	public gameDestroy() {
		this.gameCore.dispose();
	}

	/**
	 * Perform an update and render a new frame
	 */
	public gameUpdate() {
		this.gameCore.update();
	}

	//=====================//
	//  GAME PLAYER INPUT  //
	//=====================//

	/**
	 * @param x the current x position of the mouse
	 * @param y the current y position of the mouse
	 * @param dx the amount of movement in x direction
	 * @param dy the amount of movement in y direction
	 * @param width the (client) width of the canvas-element
	 * @param height the (client) height of the canvas-element
	 * @param btnLeftDown whether the left button is pressed down
	 * @param btnRightDown whether the right button is pressed down
	 */
	public gameInputMouseMove(x: number, y: number, dx: number, dy: number, width: number, height: number, btnLeftDown: boolean, btnRightDown: boolean) {
		this.gameCore.input.onMouseMove(x, y, dx, dy, width, height, btnLeftDown, btnRightDown);
	}

	/**
	 * @param x the current x position of the mouse
	 * @param y the current y position of the mouse
	 * @param delta the amount of scrolling
	 */
	public gameInputMouseScroll(delta: number, x: number, y: number) {
		this.gameCore.input.onMouseScroll(delta, x, y);
	}

	/**
	 * When the mouse has left the game-canvas
	 */
	public gameInputMouseLeave() {
		this.gameCore.input.onMouseLeave();
	}

	/**
	 *
	 * @param x the current x position of the mouse
	 * @param y the current y position of the mouse
	 * @param width the (client) width of the canvas-element
	 * @param height the (client) height of the canvas-element
	 */
	public gameInputMouseClick(x: number, y: number, width: number, height: number) {
		this.gameCore.input.onMouseClick(x, y, width, height);
	}

}