import {Country} from "../../../models/country";
import {GameStateAccess} from "../../../state/access/GameStateAccess";

export function usePlayerCountry(): Country {
    const playerId = "smiley_4_"; // temp
    return GameStateAccess.useCountryById(playerId);
}