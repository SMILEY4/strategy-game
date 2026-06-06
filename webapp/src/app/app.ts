import {createDI, type FactoryMap} from "@modules/utilities/di.ts";
import {httpClient, type HttpClient} from "@app/api/http-client.ts";


interface EnvShape {
    serverUrl: string
}

export const Env: EnvShape = {
    // @ts-expect-error window.RUNTIME_CONFIG is not known to TypeScript
    serverUrl: window.RUNTIME_CONFIG?.SERVER_URL
        ?? import.meta.env.VITE_SERVER_URL
        ?? "http://localhost:8080",
}


interface DIShape {
    httpClient: HttpClient;
}


export const DIConfig = {
    httpClient: {
        scope: "singleton",
        create: () => httpClient({
            baseUrl: Env.serverUrl,
            authHandler: {
                getToken: () => "todo", // todo
                handleUnauthorized: () => undefined // todo
            }
        })
    },
} satisfies FactoryMap<DIShape>;


export const DI = createDI(DIConfig);