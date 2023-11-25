import {RemoteGameStateRepository} from "./RemoteGameStateRepository";
import {Province} from "../../models/province";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";

export class ProvinceRepository {

    private readonly remoteRepository: RemoteGameStateRepository;

    constructor(remoteRepository: RemoteGameStateRepository) {
        this.remoteRepository = remoteRepository;
    }

    public getProvinceByCity(cityId: string): Province {
        const province = this.remoteRepository.getGameState().provinces.find(p => p.cities.map(c => c.identifier.id).indexOf(cityId) !== -1);
        if (province) {
            return province;
        } else {
            throw new Error("No province with city " + cityId);
        }
    }

}

export namespace ProvinceRepository {

    export function useProvinceById(provinceId: string): Province {
        const province = RemoteGameStateStore.useState(state => state.gameState.provinces.find(c => c.identifier.id === provinceId));
        if (province) {
            return province;
        } else {
            throw new Error("No province with id " + provinceId);
        }
    }

}