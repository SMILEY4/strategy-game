/**
 * Information about a world
 */
import {GlobalState} from "../../../state/globalState";


export interface WorldMeta {
	worldId: string;
}

export interface ApiClient {

	/**
	 * Send a request to create new world
	 * @return information about the created world
	 */
	createWorld: () => Promise<WorldMeta>;

	/**
	 * Opens a new websocket connection for world-related messages
	 */
	openWorldConnection: () => Promise<void>;

	/**
	 * Send a request to join a world. The websocket-connection must be opened before
	 * @param worldId the id of the world
	 * @param playerName the name of the player
	 */
	sendJoinWorld: (worldId: string, playerName: string) => void;

	/**
	 * Submit the commands of the current turn
	 * @param worldId the id of the world
	 * @param playerCommands the commands to submit
	 */
	submitTurn: (worldId: string, playerCommands: GlobalState.PlaceMarkerCommand[]) => void;
}