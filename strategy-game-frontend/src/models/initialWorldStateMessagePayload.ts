export interface InitialWorldStateMessagePayload {
    game: {
        game: {
            _key: string,
            turn: number,
            players: any,
        },
        countries: any,
        tiles: ({
            _key: string,
            gameId: string,
            position: {
                q: number,
                r: number
            },
            data: {
                terrainType: string
            },
            content: TileContent[]
        })[],
        cities: ({
            _key: string,
            gameId: string,
            tileId: string
        })[]
    };
}

export interface TileContent {
    type: "city" | "marker";
}

export interface CityTileContent extends TileContent {
}

export interface MarkerTileContent extends TileContent {
    countryId: string;
}