import {WorldHandler} from "../ports/provided/worldHandler";
import {StateProvider} from "../ports/required/stateProvider";
import {ApiClient} from "../ports/required/apiClient";


export class WorldService implements WorldHandler {

	private readonly client: ApiClient;
	private readonly stateProvider: StateProvider;


	constructor(stateProvider: StateProvider, client: ApiClient) {
		this.stateProvider = stateProvider;
		this.client = client;
	}


	public create(): Promise<string> {
		return this.client.createWorld();
	}


	public join(worldId: string): Promise<void> {
		return this.client.openWorldConnection(worldId)
			.then(() => this.stateProvider.getState().setLoading(worldId))
	}

	public setWorldState(state: any): void {
		this.stateProvider.getState().setMarkers(state.markers)
		this.stateProvider.getState().setTiles(state.map.tiles)
		this.stateProvider.getState().setActive();
	}


}