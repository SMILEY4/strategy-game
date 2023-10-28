import {RemoteGameStateRepository} from "./RemoteGameStateRepository";
import {Country} from "../../models/country";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";

export class CountryRepository {

    private readonly remoteRepository: RemoteGameStateRepository;

    constructor(remoteRepository: RemoteGameStateRepository) {
        this.remoteRepository = remoteRepository;
    }

    public getCountryOrNull(countryId: string): Country | null {
        const country = this.remoteRepository.getGameState().countries.find(c => c.identifier.id === countryId);
        if (country) {
            return country;
        } else {
            return null;
        }
    }

    public getCountry(countryId: string): Country {
        const country = this.remoteRepository.getGameState().countries.find(c => c.identifier.id === countryId);
        if (country) {
            return country;
        } else {
            throw new Error("No country with id " + countryId)
        }
    }

    public getCountryByUserIdOrNull(userId: string): Country | null {
        const country = this.remoteRepository.getGameState().countries.find(c => c.player.userId === userId);
        if (country) {
            return country;
        } else {
            return null;
        }
    }

    public getCountryByUserIdOr(userId: string): Country {
        const country = this.remoteRepository.getGameState().countries.find(c => c.player.userId === userId);
        if (country) {
            return country;
        } else {
            throw new Error("No country with user-id " + userId)
        }
    }

}

export namespace CountryRepository {

    export function useCountryById(countryId: string): Country {
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.identifier.id === countryId));
        if (country) {
            return country;
        } else {
            throw new Error("No country with id " + countryId)
        }
    }

    export function useCountryByUserId(userId: string): Country {
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.player.userId === userId));
        if (country) {
            return country;
        } else {
            throw new Error("No country with user " + userId)
        }
    }

}