import {Country} from "../models/country";
import {optional} from "../../shared/optional";
import {useCountryByUser} from "./useCountryByUser";
import {useUserIdOrNull} from "./useUserId";

export function useCountryPlayer(): Country {
    return optional(useCountryPlayerOrNull()).getValueOrThrow();
}

export function useCountryPlayerOrNull(): Country | null {
    return useCountryByUser(useUserIdOrNull());
}