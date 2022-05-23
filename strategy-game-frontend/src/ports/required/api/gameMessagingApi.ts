import {PlaceMarkerCommand} from "../../../state/models/PlaceMarkerCommand";

export interface GameMessagingApi {
    open: (gameId: string) => Promise<void>;
    close: () => void;
    sendSubmitTurn: (commands: PlaceMarkerCommand[]) => void;
}