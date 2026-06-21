import {createDI, type FactoryMap} from "@modules/utilities/di.ts";
import {httpClient, type HttpClient} from "@modules/client/http-client.ts";
import {websocketClient, type WebsocketClient} from "@modules/client/websocket-client.ts";
import {authClient} from "@app/features/auth/auth.client.ts";
import {authRepository} from "@app/features/auth/auth-repository.ts";
import {logInUseCase} from "@app/features/auth/auth.use-case.login.ts";
import {userClient} from "@app/features/user/user.client.ts";
import {registerUseCase} from "@app/features/user/user.use-case.register.ts";


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
    httpClient: HttpClient;
    wsClient: WebsocketClient;
    // auth
    authClient: ReturnType<typeof authClient>,
    authRepository: ReturnType<typeof authRepository>,
    logInUseCase: ReturnType<typeof logInUseCase>
    // user
    userClient: ReturnType<typeof userClient>,
    registerUseCase: ReturnType<typeof registerUseCase>
}


export const DIConfig = {
    // common
    httpClient: {
        scope: "singleton",
        create: () => httpClient({
            baseUrl: Env.serverUrl,
            authHandler: {
                getToken: () => "todo", // todo
                handleUnauthorized: () => undefined, // todo
            },
        }),
    },
    wsClient: {
        scope: "singleton",
        create: () => websocketClient({
            baseUrl: Env.serverUrl,
        }),
    },
    // auth
    authClient: {
        scope: "transient",
        create: (resolve) => authClient({httpClient: resolve.httpClient}),
    },
    authRepository: {
        scope: "singleton",
        create: (resolve) => authRepository({authClient: resolve.authClient}),
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
} satisfies FactoryMap<DIShape>;


export const DI = createDI(DIConfig);