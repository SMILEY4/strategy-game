import {Tile} from "./tile";
import {Color} from "./color";

export interface MapModeRenderData {
    grayscale: boolean,
    fillColor: (tile: Tile) => number[],
    borderColor: (tile: Tile) => number[],
    borderDefault: boolean,
    borderCheck:  (a: Tile, b: Tile) => boolean
}

export class MapMode {

    public static readonly DEFAULT = new MapMode(0, "Default", {
        grayscale: false,
        fillColor: tile => tile.owner?.country ? Color.colorToRgbArray(tile.owner.country.color) : Color.colorToRgbArray(Color.BLACK),
        borderColor: tile => tile.owner?.country ? Color.colorToRgbArray(tile.owner.country.color) : Color.colorToRgbArray(Color.BLACK),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = ta.owner?.country.id;
            const b = tb.owner?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly COUNTRIES = new MapMode(1, "Countries", {
        grayscale: true,
        fillColor: tile => tile.owner?.country ? Color.colorToRgbArray(tile.owner.country.color) : Color.colorToRgbArray(Color.BLACK),
        borderColor: tile => tile.owner?.country ? Color.colorToRgbArray(tile.owner.country.color) : Color.colorToRgbArray(Color.BLACK),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = ta.owner?.country.id;
            const b = tb.owner?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly PROVINCES = new MapMode(2, "Provinces", {
        grayscale: true,
        fillColor: tile => tile.owner?.province ? Color.colorToRgbArray(tile.owner.province.color) : Color.colorToRgbArray(Color.BLACK),
        borderColor: tile => tile.owner?.province ? Color.colorToRgbArray(tile.owner.province.color) : Color.colorToRgbArray(Color.BLACK),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = ta.owner?.province.id;
            const b = tb.owner?.province.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly CITIES = new MapMode(3, "Cities", {
        grayscale: true,
        fillColor: tile => tile.owner?.province ? Color.colorToRgbArray(tile.owner.province.color) : Color.colorToRgbArray(Color.BLACK),
        borderColor: tile => tile.owner?.province ? Color.colorToRgbArray(tile.owner.province.color) : Color.colorToRgbArray(Color.BLACK),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = ta.owner?.city?.id;
            const b = tb.owner?.city?.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly TERRAIN = new MapMode(4, "Terrain", {
        grayscale: false,
        fillColor: () => Color.colorToRgbArray(Color.BLACK),
        borderColor: tile => tile.owner?.country ? Color.colorToRgbArray(tile.owner.country.color) : Color.colorToRgbArray(Color.BLACK),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = ta.owner?.country.id;
            const b = tb.owner?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly RESOURCES = new MapMode(5, "Resources", {
        grayscale: true,
        fillColor: (tile) => tile.resourceType ? Color.colorToRgbArray(tile.resourceType.color) : Color.colorToRgbArray(Color.BLACK),
        borderColor: tile => tile.owner?.country ? Color.colorToRgbArray(tile.owner.country.color) : Color.colorToRgbArray(Color.BLACK),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = ta.owner?.country.id;
            const b = tb.owner?.country.id;
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