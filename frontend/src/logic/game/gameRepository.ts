import {Command} from "../../models/command";
import {CommandStore} from "./store/commandStore";
import {Country} from "../../models/country";
import {CountriesStore} from "./store/countriesStore";

export class GameRepository {

    addCommand(command: Command) {
        CommandStore.useState.getState().add(command);
    }

    setCommands(commands: Command[]) {
        CommandStore.useState.getState().set(commands);
    }

    getCountry(id: string): Country | null {
        const elements = CountriesStore.useState.getState().countries.filter(c => c.identifier.id === id)
        if (elements) {
            return elements[0]
        } else {
            return null
        }
    }

}