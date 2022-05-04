import {WorldHandler} from "../ports/provided/worldHandler";
import {StateProvider} from "../ports/required/stateProvider";
import {ApiClient} from "../ports/required/apiClient";
import {WorldMeta} from "../../state/models/WorldMeta";


export class WorldService implements WorldHandler {

	private readonly client: ApiClient;
	private readonly stateProvider: StateProvider;


	constructor(stateProvider: StateProvider, client: ApiClient) {
		this.stateProvider = stateProvider;
		this.client = client;
	}


	public create(): Promise<WorldMeta> {
		return this.client.createWorld();
	}


	public join(worldId: string): Promise<void> {
		return this.client.openWorldConnection()
			.then(() => this.stateProvider.getState().setLoading(worldId))
			.then(() => this.client.sendJoinWorld(worldId));
	}


	public setInitialState(state: any): void {
		this.stateProvider.getState().setActive(state.map.tiles);
	}

}