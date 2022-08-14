export interface MsgTileContent {
    type: "city" | "marker";
}

export interface MsgMarkerTileContent extends MsgTileContent {
    countryId: string;
}