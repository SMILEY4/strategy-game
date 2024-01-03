import {Tile, TileInfluence} from "./tile";
import {Color} from "./color";
import {getHiddenOrDefault, getHiddenOrNull, mapHiddenOrDefault} from "./hiddenType";

export interface MapModeRenderData {
    grayscale: boolean,
    context: (tiles: Tile[]) => any
    fillColor: (tile: Tile, context: any) => number[],
    borderColor: (tile: Tile, context: any) => number[],
    borderDefault: boolean,
    borderCheck: (a: Tile, b: Tile) => boolean
}

export class MapMode {

    private static readonly NO_COLOR = Color.colorToRgbArray(Color.BLACK);

    private static toColor(color: Color | null | undefined, alpha?: number) {
        if (color) {
            const rgb = Color.colorToRgbArray(color);
            if (alpha !== undefined && alpha !== null) {
                rgb[0] *= alpha;
                rgb[1] *= alpha;
                rgb[2] *= alpha;
            }
            return rgb;
        } else {
            return MapMode.NO_COLOR;
        }

    }

    public static readonly DEFAULT = new MapMode(0, "Default", {
        grayscale: false,
        context: () => null,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id;
            const b = getHiddenOrNull(tb.political.owner)?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly COUNTRIES = new MapMode(1, "Countries", {
        grayscale: true,
        context: () => null,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id;
            const b = getHiddenOrNull(tb.political.owner)?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly PROVINCES = new MapMode(2, "Provinces", {
        grayscale: true,
        context: () => null,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.province.id;
            const b = getHiddenOrNull(tb.political.owner)?.province.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly CITIES = new MapMode(3, "Cities", {
        grayscale: true,
        context: () => null,
        fillColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.province.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.city?.id ?? null;
            const b = getHiddenOrNull(tb.political.owner)?.city?.id ?? null;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly TERRAIN = new MapMode(4, "Terrain", {
        grayscale: false,
        context: () => null,
        fillColor: () => MapMode.NO_COLOR,
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id;
            const b = getHiddenOrNull(tb.political.owner)?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly RESOURCES = new MapMode(5, "Resources", {
        grayscale: true,
        context: () => null,
        fillColor: tile => mapHiddenOrDefault(tile.basic.resourceType, MapMode.NO_COLOR, resource => MapMode.toColor(resource.color)),
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id;
            const b = getHiddenOrNull(tb.political.owner)?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        },
        borderDefault: false,
    });

    public static readonly INFLUENCE = new MapMode(6, "Influence", {
        grayscale: true,
        context: () => null,
        fillColor: (tile) => {
            const influences = getHiddenOrDefault(tile.political.influences, []);
            let maxInfluence: TileInfluence | null = null;
            for (let influence of influences) {
                if (maxInfluence === null || maxInfluence.amount < influence.amount) {
                    maxInfluence = influence;
                }
            }
            if (maxInfluence) {
                const alpha = Math.min(1, maxInfluence.amount / 5); // todo: "5" = country border threshold
                return MapMode.toColor(maxInfluence.country.color, alpha);
            } else {
                return MapMode.NO_COLOR;
            }
        },
        borderColor: tile => mapHiddenOrDefault(tile.political.owner, MapMode.NO_COLOR, owner => MapMode.toColor(owner?.country.color)),
        borderCheck: (ta: Tile, tb: Tile) => {
            const a = getHiddenOrNull(ta.political.owner)?.country.id;
            const b = getHiddenOrNull(tb.political.owner)?.country.id;
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
        MapMode.INFLUENCE,
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