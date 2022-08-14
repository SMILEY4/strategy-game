export interface MsgTileContent {
    type: "marker";
}

export interface MsgMarkerTileContent extends MsgTileContent {
    countryId: string;
}