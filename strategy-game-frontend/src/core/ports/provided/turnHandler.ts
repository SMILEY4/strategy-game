import {PlayerMarker} from "../../../state/models/PlayerMarker";

export interface TurnHandler {
	placeMarker: (q: number, r: number) => void;
	submit: () => void;
	startNext: (addedMarkers: PlayerMarker[]) => void;
}