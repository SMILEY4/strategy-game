import {RemoteGameStateRepository} from "./RemoteGameStateRepository";
import {Country} from "../../models/country";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";
import {CommandRepository} from "./CommandRepository";
import {Command} from "../../models/command";
import {CommandType} from "../../models/commandType";
import {LocalCommandStateStore} from "../local/LocalCommandStore";

export class CountryRepository {

    private readonly remoteRepository: RemoteGameStateRepository;
    private readonly commandRepository: CommandRepository;

    constructor(remoteRepository: RemoteGameStateRepository, commandRepository: CommandRepository) {
        this.remoteRepository = remoteRepository;
        this.commandRepository = commandRepository;
    }

    public getCountryByUserId(userId: string): Country {
        const country = this.remoteRepository.getGameState().countries.find(c => c.player.userId === userId);
        if (country) {
            return country;
        } else {
            throw new Error("No country with user-id " + userId);
        }
    }

}

export namespace CountryRepository {

    export function useCountryById(countryId: string): Country {
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.identifier.id === countryId));
        if (country) {
            return country
        } else {
            throw new Error("No country with id " + countryId);
        }
    }

    export function useCountryByUserId(userId: string): Country {
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.player.userId === userId));
        if (country) {
            return country
        } else {
            throw new Error("No country with user " + userId);
        }
    }

}