import {InputHandler} from "../ports/provided/inputHandler";
import {StateProvider} from "../ports/required/stateProvider";
import {TilePicker} from "./tilemap/tilePicker";

export class InputService implements InputHandler {

	private readonly stateProvider: StateProvider;
	private readonly tilePicker: TilePicker;

	constructor(stateProvider: StateProvider, tilePicker: TilePicker) {
		this.stateProvider = stateProvider;
		this.tilePicker = tilePicker;
	}


	public onMouseMove(dx: number, dy: number, x: number, y: number, isLeftDown: boolean): void {
		if (isLeftDown) {
			this.stateProvider.getState().moveCamera(dx, dy);
		}
		const tile = this.tilePicker.tileAt(x, y);
		if (tile) {
			this.stateProvider.getState().setTileMouseOver([tile.q, tile.r]);
		} else {
			this.stateProvider.getState().setTileMouseOver(null);
		}
	}


	public onMouseScroll(d: number): void {
		this.stateProvider.getState().zoomCamera(d > 0 ? 0.1 : -0.1);
	}


	public onMouseClick(x: number, y: number): void {
		const tile = this.tilePicker.tileAt(x, y);
		if (tile) {
			this.stateProvider.getState().addCommandPlaceMarker(tile.q, tile.r);
		}
	}


}