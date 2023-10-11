import {Country} from "../../../models/country";
import {GameStateAccess} from "../../../state/access/GameStateAccess";
import {AppCtx} from "../../../logic/appContext";
import {UserService} from "../../../logic/user/userService";

export function usePlayerCountry(): Country {
    const playerId = AppCtx.di.get(AppCtx.DIQ.UserService).getUserId()
    return GameStateAccess.useCountryById(playerId);
}