export interface MatchListEntry {
    id: string,
    name: string,
}

export interface MatchDetails {
    id: string,
    name: string,
    participants: string[],
    state: string,
    gameId: string | null
}