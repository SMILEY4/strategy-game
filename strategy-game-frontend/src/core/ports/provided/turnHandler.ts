import {GlobalState} from "../../../state/globalState";

export interface TurnHandler {
	placeMarker: (q: number, r: number) => void
	submit: () => void;
	startNext: (addedMarkers: GlobalState.PlayerMarker[]) => void;
}