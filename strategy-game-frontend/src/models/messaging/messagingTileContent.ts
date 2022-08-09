export interface MsgTileContent {
    type: "city" | "marker";
}

export interface MsgCityTileContent extends MsgTileContent {
}

export interface MsgMarkerTileContent extends MsgTileContent {
    countryId: string;
}