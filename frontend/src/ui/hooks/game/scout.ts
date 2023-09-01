import {TileIdentifier} from "../../../models/tile";
import {AppCtx} from "../../../logic/appContext";

export function usePlaceScout() {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    return (tile: TileIdentifier) => {
        commandService.placeScout(tile)
    }
}