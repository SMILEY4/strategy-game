export type Scope = "singleton" | "transient"

// Defines how to create an instance of type T, with access to dependencies (Deps)
export type Factory<T, Deps> = {
    scope: Scope,
    create: (resolve: Deps) => T,
}

// A map of factory names to their factory definitions, all sharing the same Deps type
export type FactoryMap<Deps> = Record<string, Factory<unknown, Deps>>;

// Extract the actual instance types from a FactoryMap (unwraps Factory<T> to just T)
export type Instances<F extends FactoryMap<unknown>> = {
    [K in keyof F]: F[K] extends Factory<infer T, unknown> ? T : never
}

// Creates a DI container that lazily instantiates factories
// Deps: the shape of all available dependencies (resolver type)
export function createDI<Deps>(factories: FactoryMap<Deps>): Deps {
    const singletons = new Map<keyof typeof factories, unknown>();
    const di = {} as Deps;

    for (const key in factories) {
        Object.defineProperty(di, key, {
            enumerable: true,
            get: () => {
                const factory = factories[key];
                if (factory.scope === "singleton") {
                    if (!singletons.has(key)) {
                        singletons.set(key, factory.create(di));
                    }
                    return singletons.get(key);
                }
                if (factory.scope === "transient") {
                    return factory.create(di);
                }
                throw new Error("Unexpected scope: " + factory.scope);
            },
        });
    }

    return di;
}