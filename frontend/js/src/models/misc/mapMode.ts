import {Tile} from "../tile/tile";
import {Color} from "../../common/color/color";

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
	fillColor: (tile: Tile, context: any) => Color,
	/**
	 * A border color of the tile
	 */
	borderColor: (tile: Tile, context: any) => Color,
	/**
	 * Whether to show a border when the tile has no neighbour tile
	 */
	borderDefault: boolean,
	/**
	 * A check determining whether there is a border between the two given tiles.
	 * Return 'true' to show a border inside tile "a" facing tile "b".
	 */
	borderCheck: (a: Tile, b: Tile) => boolean
}

export class MapMode {

	public static readonly DEFAULT = new MapMode(
		0,
		"Default",
		"Shows basic terrain as well as country borders.",
		{
			grayscale: false,
			context: () => null,
			fillColor: tile => Color.EMPTY,
			borderColor: tile => Color.EMPTY,
			borderCheck: (ta: Tile, tb: Tile) => false,
			borderDefault: true,
		},
	);

	public static readonly REALMS = new MapMode(
		1,
		"Realms",
		"Focuses on realm borders while hiding unrelated information.",
		{
			grayscale: true,
			context: () => null,
			fillColor: tile => Color.EMPTY,
			borderColor: tile => Color.EMPTY,
			borderCheck: (ta: Tile, tb: Tile) => false,
			borderDefault: true,
		},
	);

	public static readonly SETTLEMENTS = new MapMode(
		3,
		"Settlements",
		"Focuses on individual settlement borders while hiding unrelated information.",
		{
			grayscale: true,
			context: () => null,
			fillColor: tile => Color.EMPTY,
			borderColor: tile => Color.EMPTY,
			borderCheck: (ta: Tile, tb: Tile) => false,
			borderDefault: true,
		},
	);

	public static readonly RESOURCES = new MapMode(
		5,
		"Resources",
		"Highlights and displays resources available on tiles.",
		{
			grayscale: true,
			context: () => null,
			fillColor: tile => tile.base.value?.resourceType?.color ?? Color.EMPTY,
			borderColor: () => Color.EMPTY,
			borderCheck: () => false,
			borderDefault: false,
		},
	);

	public static readonly TERRAIN = new MapMode(
		6,
		"Terrain",
		"Focuses on terrain and hides unrelated information.",
		{
			grayscale: false,
			context: () => null,
			fillColor: () => Color.EMPTY,
			borderColor: () => Color.EMPTY,
			borderCheck: () => false,
			borderDefault: false,
		},
	);

	private static readonly values = [
		MapMode.DEFAULT,
		MapMode.RESOURCES,
		MapMode.REALMS,
		MapMode.SETTLEMENTS,
		MapMode.TERRAIN,
	];

	public static getValues(): MapMode[] {
		return MapMode.values;
	}

	readonly id: number;
	readonly displayString: string;
	readonly description: string;
	readonly renderData: MapModeRenderData;

	private constructor(id: number, displayString: string, description: string, renderData: MapModeRenderData) {
		this.id = id;
		this.description = description;
		this.displayString = displayString;
		this.renderData = renderData;
	}
}