export interface GameLobbyJoinAction {
    perform: (gameId: string) => Promise<void>
}