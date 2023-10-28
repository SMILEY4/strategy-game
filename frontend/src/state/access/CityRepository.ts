import {RemoteGameStateRepository} from "./RemoteGameStateRepository";
import {City} from "../../models/city";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";

export class CityRepository {

    private readonly remoteRepository: RemoteGameStateRepository;

    constructor(remoteRepository: RemoteGameStateRepository) {
        this.remoteRepository = remoteRepository;
    }

    public getCities(): City[] {
        return this.remoteRepository.getGameState().cities;
    }

    public getCity(cityId: string): City {
        const city = this.remoteRepository.getGameState().cities.find(c => c.identifier.id === cityId);
        if (city) {
            return city;
        } else {
            throw new Error("No city with id " + cityId + " found");
        }
    }

}

export namespace CityRepository {

    export function useCityById(cityId: string): City {
        const city = RemoteGameStateStore.useState(state => state.cities.find(c => c.identifier.id === cityId));
        if (city) {
            return city;
        } else {
            throw new Error("No city with id " + cityId);
        }
    }

}