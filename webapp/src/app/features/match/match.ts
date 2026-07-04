/** A match entry in the match list. */
export interface MatchListEntry {
    id: string,
    name: string,
}

/** Full details of a match, including participants and linked game. */
export interface MatchDetails {
    id: string,
    name: string,
    participants: string[],
    state: string,
    gameId: string | null
}