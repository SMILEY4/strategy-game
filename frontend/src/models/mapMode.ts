import {Tile} from "./tile";
import {Color} from "./color";
import {getHiddenOrNull, mapHiddenOrDefault, mapHiddenOrNull} from "./hiddenType";

export interface MapModeRenderData {
    grayscale: boolean,
    fillColor: (tile: Tile) => number[],
    borderColor: (tile: Tile) => number[],
    borderDefault: boolean,
    borderCheck:  (a: Tile, b: Tile) => boolean
}

export class MapMode {

    private static readonly NO_COLOR = Color.colorToRgbArray(Color.BLACK)

    private static toColor(color: Color | null | undefined)  {
        return color ? Color.colorToRgbArray(color) : MapMode.NO_COLOR
    }

    public static readonly DEFAULT = new MapMode(0, "Default", {
        grayscale: false,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id
            const b = getHiddenOrNull(tb.political.owner)?.country.id
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly COUNTRIES = new MapMode(1, "Countries", {
        grayscale: true,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id
            const b = getHiddenOrNull(tb.political.owner)?.country.id
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly PROVINCES = new MapMode(2, "Provinces", {
        grayscale: true,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.province.id
            const b = getHiddenOrNull(tb.political.owner)?.province.id
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly CITIES = new MapMode(3, "Cities", {
        grayscale: true,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.city?.id ?? null
            const b = getHiddenOrNull(tb.political.owner)?.city?.id ?? null
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly TERRAIN = new MapMode(4, "Terrain", {
        grayscale: false,
        fillColor: () => MapMode.NO_COLOR,
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id
            const b = getHiddenOrNull(tb.political.owner)?.country.id
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly RESOURCES = new MapMode(5, "Resources", {
        grayscale: true,
        fillColor: tile => mapHiddenOrDefault(tile.basic.resourceType, MapMode.NO_COLOR, resource => MapMode.toColor(resource.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id
            const b = getHiddenOrNull(tb.political.owner)?.country.id
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    private static readonly values = [
        MapMode.DEFAULT,
        MapMode.COUNTRIES,
        MapMode.PROVINCES,
        MapMode.CITIES,
        MapMode.TERRAIN,
        MapMode.RESOURCES,
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