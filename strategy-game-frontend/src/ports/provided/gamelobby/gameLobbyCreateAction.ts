export interface GameLobbyCreateAction {
    perform: () => Promise<string>
}