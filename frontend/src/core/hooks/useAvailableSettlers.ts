import {useCommands} from "./useCommands";
import {useCountryById} from "./useCountryById";

export function useAvailableSettlers(countryId: string): number {
    const country = useCountryById(countryId);
    if (country) {
        const baseSettlers = country.availableSettlers ? country.availableSettlers : 0;
        const usedSettlers = useCommands().filter(cmd => cmd.commandType === "create-city").length;
        return baseSettlers - usedSettlers;
    } else {
        return 0;
    }
}
