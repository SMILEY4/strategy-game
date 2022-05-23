export interface GameApi {
    create: () => Promise<string>
    join: (gameId: string) => Promise<void>
    list: () => Promise<string[]>
}