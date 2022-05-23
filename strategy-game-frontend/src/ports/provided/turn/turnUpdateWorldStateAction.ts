export interface TurnUpdateWorldStateAction {
    perform: (
        tiles: ({
            q: number,
            r: number,
            tileId: number
        })[],
        markers: ({
            q: number,
            r: number,
            userId: string
        })[]
    ) => void;
}