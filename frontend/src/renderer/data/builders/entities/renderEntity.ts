import {TileIdentifier} from "../../../../models/tile";
import {CountryIdentifier} from "../../../../models/country";

export interface RenderEntity {
    type: "scout" | "city"
    tile: TileIdentifier,
    label: string | null,
    country: CountryIdentifier
}