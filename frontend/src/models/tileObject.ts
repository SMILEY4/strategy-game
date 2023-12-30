import {CountryIdentifier} from "./country";
import {CityIdentifier} from "./city";

export interface TileObject {
    type: "marker" | "scout" | "city";
    country: CountryIdentifier;
}

export interface MarkerTileObject extends TileObject {
    type: "marker";
    label: string;
}

export interface ScoutTileObject extends TileObject {
    type: "scout";
    creationTurn: number;
}

export interface CityTileObject extends TileObject {
    type: "city";
    city: CityIdentifier;
}
