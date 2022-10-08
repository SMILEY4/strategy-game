import {Country} from "../../models/state/country";
import {optional} from "../../shared/optional";
import {useCountry} from "./useCountry";
import {useUserId} from "./useUserId";

export function useCountryPlayer(): Country {
    return optional(useCountry(useUserId())).getValueOrThrow();
}