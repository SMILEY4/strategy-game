export interface MsgTileContent {
    type: "marker" | "scout";
}

export interface MsgMarkerTileContent extends MsgTileContent {
    countryId: string;
}

export interface MsgScoutTileContent extends MsgTileContent {
    countryId: string;
    turn: number;
}