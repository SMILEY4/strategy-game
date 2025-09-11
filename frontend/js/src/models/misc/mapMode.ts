import {Color} from "../../common/color";
import {Tile} from "../tile/tile";

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
     * A check determining whether there is a border between the two given tiles.
     * Return 'true' to show a border inside tile "a" facing tile "b".
     */
    borderCheck: (a: Tile, b: Tile) => boolean
}

export class MapMode {

    public static readonly NO_COLOR: [number, number, number, number] = Color.colorToRgbaArray(Color.BLACK, 0);

    private static toColor(color: Color | null | undefined, alpha?: number): [number, number, number, number] {
        if (color) {
            return Color.colorToRgbaArray(color, alpha ?? 1.0);
        } else {
            return MapMode.NO_COLOR;
        }
    }

    public static readonly DEFAULT = new MapMode(
        0,
        "Default",
        "Shows basic terrain as well as country borders.",
        {
            grayscale: false,
            context: () => null,
            fillColor: tile => tile.political.visible && tile.political.value.controlledBy != null
                ? MapMode.toColor(tile.political.value.controlledBy.country.color, 0.7)
                : MapMode.NO_COLOR,
            borderColor: tile => tile.political.visible && tile.political.value.controlledBy != null
                ? MapMode.toColor(tile.political.value.controlledBy.country.color)
                : MapMode.NO_COLOR,
            borderCheck: (ta: Tile, tb: Tile) => {
                const countryA = ta.political.visible && ta.political.value.controlledBy != null
                    ? ta.political.value.controlledBy.country.id
                    : null;
                const countryB = tb.political.visible && tb.political.value.controlledBy != null
                    ? tb.political.value.controlledBy.country.id
                    : null;
                return countryA !== countryB;
            },
            borderDefault: true,
        },
    );

    public static readonly COUNTRIES = new MapMode(
        1,
        "Countries",
        "Focuses on country borders while hiding unrelated information.",
        {
            grayscale: true,
            context: () => null,
            fillColor: tile => tile.political.visible && tile.political.value.controlledBy != null
                ? MapMode.toColor(tile.political.value.controlledBy.country.color)
                : MapMode.NO_COLOR,
            borderColor: tile => tile.political.visible && tile.political.value.controlledBy != null
                ? MapMode.toColor(tile.political.value.controlledBy.country.color)
                : MapMode.NO_COLOR,
            borderCheck: (ta: Tile, tb: Tile) => {
                const countryA = ta.political.visible && ta.political.value.controlledBy != null
                    ? ta.political.value.controlledBy.country.id
                    : null;
                const countryB = tb.political.visible && tb.political.value.controlledBy != null
                    ? tb.political.value.controlledBy.country.id
                    : null;
                return countryA !== countryB;
            },
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
            fillColor: tile => tile.political.visible && tile.political.value.controlledBy != null
                ? MapMode.toColor(tile.political.value.controlledBy.settlement.color)
                : MapMode.NO_COLOR,
            borderColor: tile => tile.political.visible && tile.political.value.controlledBy != null
                ? MapMode.toColor(tile.political.value.controlledBy.settlement.color)
                : MapMode.NO_COLOR,
            borderCheck: (ta: Tile, tb: Tile) => {
                const settlementA = ta.political.visible && ta.political.value.controlledBy != null
                    ? ta.political.value.controlledBy.settlement.id
                    : null;
                const settlementB = tb.political.visible && tb.political.value.controlledBy != null
                    ? tb.political.value.controlledBy.settlement.id
                    : null;
                return settlementA !== settlementB;
            },
            borderDefault: true,
        },
    );

    public static readonly SETTLEMENT_LOCATIONS = new MapMode(
        4,
        "Settlement Locations",
		"Highlights valid locations for new settlements.",
        {
            grayscale: true,
            context: () => null,
            fillColor: tile => tile.isValidSettlementLocation ? [50 / 255, 194 / 255, 73 / 255, 0.9] : MapMode.NO_COLOR,
            borderColor: () => MapMode.NO_COLOR,
            borderCheck: () => false,
            borderDefault: false,
        },
    );

    public static readonly RESOURCES = new MapMode(
        5,
        "Resources",
        "Highlights and displays resources available on tiles.",
        {
            grayscale: true,
            context: () => null,
            fillColor: tile => tile.base.visible ? MapMode.toColor(tile.base.value?.resourceType.color) : MapMode.NO_COLOR,
            borderColor: () => MapMode.NO_COLOR,
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
            fillColor: () => MapMode.NO_COLOR,
            borderColor: () => MapMode.NO_COLOR,
            borderCheck: () => false,
            borderDefault: false,
        },
    );

    private static readonly values = [
        MapMode.DEFAULT,
        MapMode.RESOURCES,
        MapMode.COUNTRIES,
        MapMode.SETTLEMENTS,
        MapMode.SETTLEMENT_LOCATIONS,
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