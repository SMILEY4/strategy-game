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


interface EnvShape {
    serverUrl: string;
}

export const Env: EnvShape = {
    // @ts-expect-error window.RUNTIME_CONFIG is not known to TypeScript
    serverUrl: window.RUNTIME_CONFIG?.SERVER_URL
        ?? import.meta.env.VITE_SERVER_URL
        ?? "http://localhost:8080",
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
}


export const DIConfig = {
    // common
    clientAuthHandler: {
        scope: "singleton",
        create: (resolve) => clientAuthHandler({storage: resolve.authStorage}),
    },
    httpClient: {
        scope: "singleton",
        create: (resolve) => httpClient({
            baseUrl: Env.serverUrl,
            authHandler: resolve.clientAuthHandler,
        }),
    },
    wsClient: {
        scope: "singleton",
        create: () => websocketClient({
            baseUrl: Env.serverUrl,
        }),
    },
    // auth
    authStorage: {
        scope: "transient",
        create: () => authTokenStorage(),
    },
    authClient: {
        scope: "transient",
        create: (resolve) => authClient({httpClient: resolve.httpClient}),
    },
    authRepository: {
        scope: "singleton",
        create: (resolve) => authRepository({authStorage: resolve.authStorage, authClient: resolve.authClient}),
    },
    logInUseCase: {
        scope: "transient",
        create: (resolve) => logInUseCase({repository: resolve.authRepository}),
    },
    // user
    userClient: {
        scope: "transient",
        create: (resolve) => userClient({httpClient: resolve.httpClient}),
    },
    registerUseCase: {
        scope: "transient",
        create: (resolve) => registerUseCase({userClient: resolve.userClient}),
    },
    // matches
    matchClient: {
        scope: "transient",
        create: (resolve) => matchClient({httpClient: resolve.httpClient}),
    },
    matchRepository: {
        scope: "singleton",
        create: (resolve) => matchRepository({matchClient: resolve.matchClient}),
    },
    listMatchesUseCase: {
        scope: "transient",
        create: (resolve) => listMatchesReactiveUseCase({repository: resolve.matchRepository}),
    },
    matchDetailsUseCase: {
        scope: "transient",
        create: (resolve) => matchDetailsReactiveUseCase({repository: resolve.matchRepository}),
    },
    createMatchUseCase: {
        scope: "transient",
        create: (resolve) => createMatchUseCase({repository: resolve.matchRepository}),
    },
    deleteMatchUseCase: {
        scope: "transient",
        create: (resolve) => deleteMatchUseCase({repository: resolve.matchRepository}),
    },
    createGameUseCase: {
        scope: "transient",
        create: (resolve) => createGameUseCase({repository: resolve.matchRepository}),
    },
} satisfies FactoryMap<DIShape>;


export const DI = createDI(DIConfig);