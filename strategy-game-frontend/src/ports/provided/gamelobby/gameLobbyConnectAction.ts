export interface GameLobbyConnectAction {
    perform: (gameId: string) => Promise<void>
}