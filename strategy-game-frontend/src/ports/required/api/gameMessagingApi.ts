import {CommandPlaceMarker} from "../../models/commandPlaceMarker";

export interface GameMessagingApi {
    open: (gameId: string) => Promise<void>;
    close: () => void;
    sendSubmitTurn: (commands: CommandPlaceMarker[]) => void;
}