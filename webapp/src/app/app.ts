import {createDI, type FactoryMap} from "@/common/di.ts";


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
    //... define dependency types here
}


export const DIConfig = {
    //... dependency factories here
} satisfies FactoryMap<DIShape>;


export const DI = createDI(DIConfig);