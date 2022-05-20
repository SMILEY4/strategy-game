
export interface TurnHandler {
	placeMarker: (q: number, r: number) => void;
	submit: () => void;
	startNext: () => void;
}