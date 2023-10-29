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
            return CountryRepository.applyCommands(country, this.commandRepository.getCommands());
        } else {
            throw new Error("No country with user-id " + userId);
        }
    }

}

export namespace CountryRepository {

    export function applyCommands(country: Country, commands: Command[]): Country {
        // todo: think - is this good idea?  alternative: apply commands everywhere else outside of repository
        const usedAmountSettlers = commands.filter(cmd => cmd.type === CommandType.CITY_CREATE).length;
        return {
            ...country,
            settlers: country.settlers === null ? null : country.settlers - usedAmountSettlers,
        };
    }

    export function useCountryById(countryId: string): Country {
        const commands = LocalCommandStateStore.useState(state => state.commands);
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.identifier.id === countryId));
        if (country) {
            return CountryRepository.applyCommands(country, commands);
        } else {
            throw new Error("No country with id " + countryId);
        }
    }

    export function useCountryByUserId(userId: string): Country {
        const commands = LocalCommandStateStore.useState(state => state.commands);
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.player.userId === userId));
        if (country) {
            return CountryRepository.applyCommands(country, commands);
        } else {
            throw new Error("No country with user " + userId);
        }
    }

}