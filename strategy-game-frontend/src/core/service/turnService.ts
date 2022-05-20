import {TurnHandler} from "../ports/provided/turnHandler";
import {StateProvider} from "../ports/required/stateProvider";
import {ApiClient} from "../ports/required/apiClient";

export class TurnService implements TurnHandler {

    private readonly client: ApiClient;
    private readonly stateProvider: StateProvider;


    constructor(stateProvider: StateProvider, client: ApiClient) {
        this.stateProvider = stateProvider;
        this.client = client;
    }


    public placeMarker(q: number, r: number): void {
        this.stateProvider.getState().addCommandPlaceMarker(q, r);
    }


    public submit(): void {
        if (this.stateProvider.getState().currentState === "active") {
            const worldId = this.stateProvider.getState().worldId as string;
            const commands = this.stateProvider.getState().playerCommands;
            this.stateProvider.getState().setTurnState("submitted");
            this.client.submitTurn(worldId, commands);
        }
    }


    public startNext(): void {
        this.stateProvider.getState().setTurnState("active");
        this.stateProvider.getState().clearCommands();
    }

}