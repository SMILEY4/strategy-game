import {Route} from "../../models/route";
import {RemoteGameStateRepository} from "./RemoteGameStateRepository";

export class RouteRepository {

    private readonly remoteRepository: RemoteGameStateRepository;

    constructor(remoteRepository: RemoteGameStateRepository) {
        this.remoteRepository = remoteRepository;
    }

    public getRoutes(): Route[] {
        return this.remoteRepository.getGameState().routes;
    }

}

export namespace RouteRepository {

}