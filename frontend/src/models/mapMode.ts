import {Tile} from "./tile";
import {Color} from "./color";

export interface MapModeRenderData {
	/**
	 * Whether to render the base map as grayscale
	 */
	grayscale: boolean,
	/**
	 * Additional data shared by each tile that can be accessed by each tile in the map mode functions
	 */
	context: (tiles: Tile[]) => any
	/**
	 * A solid fill color of the tile
	 */
	fillColor: (tile: Tile, context: any) => [number, number, number, number],
	/**
	 * A border color of the tile
	 */
	borderColor: (tile: Tile, context: any) => [number, number, number, number],
	/**
	 * Whether to show a border when the tile has no neighbour tile
	 */
	borderDefault: boolean,
	/**
	 * A check determining whether there is a border between the two given tiles
	 */
	borderCheck: (a: Tile, b: Tile) => boolean
}

export class MapMode {

	private static readonly NO_COLOR: [number, number, number, number] = Color.colorToRgbaArray(Color.BLACK, 0);

	private static toColor(color: Color | null | undefined, alpha?: number): [number, number, number, number] {
		if (color) {
			return Color.colorToRgbaArray(color, alpha ?? 1.0);
		} else {
			return MapMode.NO_COLOR;
		}
	}

	public static readonly DEFAULT = new MapMode(0, "Default", {
		grayscale: false,
		context: () => null,
		fillColor: tile => MapMode.NO_COLOR,
		borderColor: tile => MapMode.NO_COLOR,
		borderCheck: (ta: Tile, tb: Tile) => false,
		borderDefault: false,
	});

	public static readonly RESOURCES = new MapMode(0, "Resources", {
		grayscale: true,
		context: () => null,
		fillColor: tile => tile.base.visible ? MapMode.toColor(tile.base.value?.resourceType.color) : MapMode.NO_COLOR,
		borderColor: tile => MapMode.NO_COLOR,
		borderCheck: (ta: Tile, tb: Tile) => false,
		borderDefault: false,
	});

	private static readonly values = [
		MapMode.DEFAULT,
		MapMode.RESOURCES,
		// MapMode.COUNTRIES,
		// MapMode.PROVINCES,
		// MapMode.CITIES,
		// MapMode.TERRAIN,
		// MapMode.INFLUENCE,
	];

	public static getValues(): MapMode[] {
		return MapMode.values;
	}

	readonly id: number;
	readonly displayString: string;
	readonly renderData: MapModeRenderData;


	private constructor(id: number, displayString: string, renderData: MapModeRenderData) {
		this.id = id;
		this.displayString = displayString;
		this.renderData = renderData;
	}
}