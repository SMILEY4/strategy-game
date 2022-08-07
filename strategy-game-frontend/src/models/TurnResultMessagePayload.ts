export interface TurnResultMessagePayload {
    game: {
        game: {
            turn: number,
            players: any,
        }
        countries: any,
        tiles: ({
            gameId: string,
            position: {
                q: number,
                r: number
            },
            data: {
                terrainType: string
            },
            content: ({
                type: string
            })[]
        })[],
        cities: ({
            gameId: string,
            tileId: string
        })[]

    },
    errors: ({
        errorMessage: string,
        command: any
    })[]
}