import {WorldMeta} from "../../../state/models/WorldMeta";
import {PlaceMarkerCommand} from "../../../state/models/PlaceMarkerCommand";
import {UserAuthData} from "../../../state/models/UserAuthData";

export interface ApiClient {

	/**
	 * Send a request to log-in
	 * @param email the email of the user
	 * @param password the password of the user
	 */
	login: (email: String, password: String) => Promise<UserAuthData>;

	/**
	 * Send a request to sign-in, i.e. create a new user
	 * @param email the email of the user
	 * @param password the password of the user
	 * @param username the name of the user
	 */
	signUp: (email: String, password: String, username: String) => Promise<void>;

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
	submitTurn: (worldId: string, playerCommands: PlaceMarkerCommand[]) => void;

	testProtected: () => Promise<string>;

}