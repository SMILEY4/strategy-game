import {Country} from "../../models/state/country";
import {optional} from "../../shared/optional";
import {useCountry} from "./useCountry";
import {useUserIdOrNull} from "./useUserId";

export function useCountryPlayer(): Country {
    return optional(useCountryPlayerOrNull()).getValueOrThrow();
}

export function useCountryPlayerOrNull(): Country | null {
    return useCountry(useUserIdOrNull());
}