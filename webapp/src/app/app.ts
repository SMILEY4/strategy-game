import {createDI, type FactoryMap} from "@modules/utilities/di.ts";
import {httpClient, type HttpClient, type HttpClientAuthHandler} from "@modules/client/http-client.ts";
import {websocketClient, type WebsocketClient} from "@modules/client/websocket-client.ts";
import {authClient} from "@app/features/auth/auth.client.ts";
import {authRepository} from "@app/features/auth/auth-repository.ts";
import {logInUseCase} from "@app/features/auth/auth.use-case.login.ts";
import {userClient} from "@app/features/user/user.client.ts";
import {registerUseCase} from "@app/features/user/user.use-case.register.ts";
import {clientAuthHandler} from "@app/features/auth/client-auth-handler.ts";
import {authTokenStorage} from "@app/features/auth/auth-token-storage.ts";
import {matchClient} from "@app/features/match/match.client.ts";
import {matchRepository} from "@app/features/match/match-repository.ts";
import {deleteMatchUseCase} from "@app/features/match/match.use-case.delete.ts";
import {listMatchesReactiveUseCase} from "@app/features/match/match.use-case.list-reactive.ts";
import {createMatchUseCase} from "@app/features/match/match.use-case.create.ts";
import {matchDetailsReactiveUseCase} from "@app/features/match/match.use-case.details-reactive.ts";
import {createGameUseCase} from "@app/features/match/match.use-case.create-game.ts";
import {gameWebsocketClient} from "@app/features/game/game.ws-client.ts";
import {gameEngine} from "@app/features/game/game.engine.ts";
import {gameClient} from "@app/features/game/game.client.ts";
import {gameRepository} from "@app/features/game/game.repository.ts";
import {tileDatabase} from "@app/features/game/database/tile.database.ts";
import {cameraControllerPlayer} from "@app/features/game/gameplay/camera/camera-controller.player.ts";
import {cameraDatabase} from "@app/features/game/database/camera.database.ts";
import {debugDatabase} from "@app/features/game/database/debug.database.ts";
import {gameActionClickTile} from "@app/features/game/gameplay/game-action.click-tile.ts";
import {selectedTileDatabase} from "@app/features/game/database/selected-tile.database.ts";
import {commandDatabase} from "@app/features/game/database/command.database.ts";
import {gameActionEndTurn} from "@app/features/game/gameplay/game-action.end-turn.ts";
import {entityDatabase} from "@app/features/game/database/entity.database.ts";
import {realmDatabase} from "@app/features/game/database/realm.database.ts";
import {gameActionJoinedGame} from "@app/features/game/gameplay/game-action.joined-game.ts";
import {interactionDatabase} from "@app/features/game/database/interaction.database.ts";
import {interactionManager} from "@modules/interaction/interaction.manager.ts";
import {createSettlementValidation} from "@app/features/game/gameplay/create-settlement.validation.ts";
import {pointerPositionDatabase} from "@app/features/game/database/pointer-position.database.ts";
import {mapModeDatabase} from "@app/features/game/database/mapmode.database.ts";


interface EnvShape {
    serverHttpUrl: string;
    serverWebsocketUrl: string;
}

/** Environment configuration resolved from window.RUNTIME_CONFIG or Vite env vars. */
export const Env: EnvShape = {
    // @ts-expect-error window.RUNTIME_CONFIG is not known to TypeScript
    serverHttpUrl: window.RUNTIME_CONFIG?.SERVER_URL
        ?? import.meta.env.VITE_SERVER_URL
        ?? "http://localhost:8080",
    // @ts-expect-error window.RUNTIME_CONFIG is not known to TypeScript
    serverWebsocketUrl: window.RUNTIME_CONFIG?.SERVER_URL
        ?? import.meta.env.VITE_SERVER_URL
        ?? "ws://localhost:8080",
};


interface DIShape {
    // common
    clientAuthHandler: HttpClientAuthHandler,
    httpClient: HttpClient;
    wsClient: WebsocketClient;
    // auth
    authStorage: ReturnType<typeof authTokenStorage>,
    authClient: ReturnType<typeof authClient>,
    authRepository: ReturnType<typeof authRepository>,
    logInUseCase: ReturnType<typeof logInUseCase>
    // user
    userClient: ReturnType<typeof userClient>,
    registerUseCase: ReturnType<typeof registerUseCase>
    // match
    matchClient: ReturnType<typeof matchClient>,
    matchRepository: ReturnType<typeof matchRepository>,
    listMatchesUseCase: ReturnType<typeof listMatchesReactiveUseCase>,
    matchDetailsUseCase: ReturnType<typeof matchDetailsReactiveUseCase>,
    createMatchUseCase: ReturnType<typeof createMatchUseCase>,
    deleteMatchUseCase: ReturnType<typeof deleteMatchUseCase>,
    createGameUseCase: ReturnType<typeof createGameUseCase>,
    // game
    mapModeDatabase: ReturnType<typeof mapModeDatabase>,
    pointerPositionDatabase: ReturnType<typeof pointerPositionDatabase>,
    interactionDatabase: ReturnType<typeof interactionDatabase>,
    interactionManager: ReturnType<typeof interactionManager>,
    gameClient: ReturnType<typeof gameClient>
    gameWebsocketClient: ReturnType<typeof gameWebsocketClient>
    gameRepository: ReturnType<typeof gameRepository>
    gameEngine: ReturnType<typeof gameEngine>
    cameraController: ReturnType<typeof cameraControllerPlayer>
    tileDatabase: ReturnType<typeof tileDatabase>
    entityDatabase: ReturnType<typeof entityDatabase>
    realmDatabase: ReturnType<typeof realmDatabase>
    commandDatabase: ReturnType<typeof commandDatabase>
    cameraDatabase: ReturnType<typeof cameraDatabase>
    debugDatabase: ReturnType<typeof debugDatabase>
    selectedTileDatabase: ReturnType<typeof selectedTileDatabase>
    gameActionEndTurn: ReturnType<typeof gameActionEndTurn>
    gameActionClickTile: ReturnType<typeof gameActionClickTile>
    gameActionJoinedGame: ReturnType<typeof gameActionJoinedGame>
    createSettlementValidation: ReturnType<typeof createSettlementValidation>
}

/** DI container configuration. Each entry specifies singleton or transient scope and its factory. */
export const DIConfig = {
    // common
    clientAuthHandler: {
        scope: "singleton",
        create: resolve => clientAuthHandler({storage: resolve.authStorage}),
    },
    httpClient: {
        scope: "singleton",
        create: resolve => httpClient({
            baseUrl: Env.serverHttpUrl,
            authHandler: resolve.clientAuthHandler,
        }),
    },
    wsClient: {
        scope: "singleton",
        create: () => websocketClient({
            baseUrl: Env.serverWebsocketUrl,
        }),
    },
    // auth
    authStorage: {
        scope: "transient",
        create: () => authTokenStorage(),
    },
    authClient: {
        scope: "transient",
        create: resolve => authClient({httpClient: resolve.httpClient}),
    },
    authRepository: {
        scope: "singleton",
        create: resolve => authRepository({authStorage: resolve.authStorage, authClient: resolve.authClient}),
    },
    logInUseCase: {
        scope: "transient",
        create: resolve => logInUseCase({repository: resolve.authRepository}),
    },
    // user
    userClient: {
        scope: "transient",
        create: resolve => userClient({httpClient: resolve.httpClient}),
    },
    registerUseCase: {
        scope: "transient",
        create: resolve => registerUseCase({userClient: resolve.userClient}),
    },
    // matches
    matchClient: {
        scope: "transient",
        create: resolve => matchClient({httpClient: resolve.httpClient}),
    },
    matchRepository: {
        scope: "singleton",
        create: resolve => matchRepository({matchClient: resolve.matchClient}),
    },
    listMatchesUseCase: {
        scope: "transient",
        create: resolve => listMatchesReactiveUseCase({repository: resolve.matchRepository}),
    },
    matchDetailsUseCase: {
        scope: "transient",
        create: resolve => matchDetailsReactiveUseCase({repository: resolve.matchRepository}),
    },
    createMatchUseCase: {
        scope: "transient",
        create: resolve => createMatchUseCase({repository: resolve.matchRepository}),
    },
    deleteMatchUseCase: {
        scope: "transient",
        create: resolve => deleteMatchUseCase({repository: resolve.matchRepository}),
    },
    createGameUseCase: {
        scope: "transient",
        create: resolve => createGameUseCase({client: resolve.matchClient, repository: resolve.matchRepository}),
    },
    // game
    interactionDatabase: {
        scope: "singleton",
        create: () => interactionDatabase(),
    },
    interactionManager: {
        scope: "singleton",
        create: resolve => {
            const db = resolve.interactionDatabase;
            return interactionManager({
                getMachineState: () => db.get().state,
                setMachineState: state => db.set({state: state}),
            });
        },
    },
    gameClient: {
        scope: "transient",
        create: resolve => gameClient({httpClient: resolve.httpClient}),
    },
    gameWebsocketClient: {
        scope: "transient",
        create: resolve => gameWebsocketClient({wsClient: resolve.wsClient}),
    },
    gameRepository: {
        scope: "singleton",
        create: () => gameRepository(),
    },
    gameEngine: {
        scope: "singleton",
        create: resolve => gameEngine({
            client: resolve.gameClient,
            wsClient: resolve.gameWebsocketClient,
            repository: resolve.gameRepository,
            tileDb: resolve.tileDatabase,
            entityDb: resolve.entityDatabase,
            realmDb: resolve.realmDatabase,
            cameraController: resolve.cameraController,
            actionClickTile: resolve.gameActionClickTile,
            actionJoinedGame: resolve.gameActionJoinedGame,
            pointerPositionDb: resolve.pointerPositionDatabase,
        }),
    },
    cameraController: {
        scope: "singleton",
        create: resolve => cameraControllerPlayer({
            cameraDb: resolve.cameraDatabase,
        }),
        // create: resolve => cameraControllerFreecam(y{
        //     cameraDb: resolve.cameraDatabase,
        // }),
    },
    mapModeDatabase: {
        scope: "singleton",
        create: () => mapModeDatabase(),
    },
    pointerPositionDatabase: {
        scope: "singleton",
        create: () => pointerPositionDatabase(),
    },
    tileDatabase: {
        scope: "singleton",
        create: () => tileDatabase(),
    },
    entityDatabase: {
        scope: "singleton",
        create: () => entityDatabase(),
    },
    realmDatabase: {
        scope: "singleton",
        create: () => realmDatabase(),
    },
    commandDatabase: {
        scope: "singleton",
        create: () => commandDatabase(),
    },
    cameraDatabase: {
        scope: "singleton",
        create: () => cameraDatabase(),
    },
    debugDatabase: {
        scope: "singleton",
        create: () => debugDatabase(),
    },
    selectedTileDatabase: {
        scope: "singleton",
        create: () => selectedTileDatabase(),
    },
    gameActionEndTurn: {
        scope: "singleton",
        create: resolve => gameActionEndTurn({commandDb: resolve.commandDatabase, wsClient: resolve.gameWebsocketClient}),
    },
    gameActionClickTile: {
        scope: "singleton",
        create: resolve => gameActionClickTile({tileDb: resolve.tileDatabase, selectedTileDb: resolve.selectedTileDatabase}),
    },
    gameActionJoinedGame: {
        scope: "singleton",
        create: resolve => gameActionJoinedGame({cameraController: resolve.cameraController}),
    },
    createSettlementValidation: {
        scope: "singleton",
        create: () => createSettlementValidation(),
    },
} satisfies FactoryMap<DIShape>;


/** Application-wide dependency injection container. */
export const DI = createDI(DIConfig);
