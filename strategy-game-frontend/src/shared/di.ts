export function createDiContainer(): DiContainer {
    return new DiContainerImpl();
}

export interface DiContainer {
    bind: (qualifier: string, builder: (ctx: DiContext) => any, config?: DiBeanConfig) => void;
    createEager: () => void;
    getContext: () => DiContext;
}


export interface DiContext {
    get: <T>(qualifier: string) => T;
}


interface DiBeanConfig {
    /**
     * singleton: bean is created once and reused (default)
     * transient: bean is created every time it is requested
     */
    lifetime?: "singleton" | "transient";
    /**
     * eager: bean is created at start (makes only sense with "singleton")
     * lazy: bean is created the first time it is requested (default)
     */
    creation?: "eager" | "lazy";
}

class DiContainerImpl implements DiContainer, DiContext {

    private readonly configs = new Map<String, DiBeanConfig>();
    private readonly bindings = new Map<String, (ctx: DiContext) => any>();

    private readonly singletons = new Map<String, any>();


    bind(qualifier: string, builder: (ctx: DiContext) => any, config?: DiBeanConfig): void {
        this.bindings.set(qualifier, builder);
        this.configs.set(qualifier, this.buildFullConfig(config));
    }

    get<T>(qualifier: string): T {
        if (this.singletons.has(qualifier)) {
            return this.singletons.get(qualifier);
        } else {
            console.debug("creating new bean", qualifier);
            const config = this.configs.get(qualifier);
            const binding = this.bindings.get(qualifier);
            if (binding === undefined || config === undefined) {
                throw new Error("No bean for qualifier " + qualifier);
            }
            const bean = binding(this);
            if (config.lifetime === "singleton") {
                this.singletons.set(qualifier, bean);
            }
            return bean;
        }
    }

    createEager(): void {
        console.log(JSON.stringify(Array.from(this.configs.entries()), null, "   "))
        Array.from(this.configs.entries())
            .filter(entry => entry[1].creation === "eager")
            .forEach(entry => {
                this.get(entry[0].toString());
            });
    }

    getContext(): DiContext {
        return this;
    }

    private buildFullConfig(config: DiBeanConfig | undefined): DiBeanConfig {
        if (config === undefined || config === null) {
            return this.defaultConfig();
        } else {
            return {
                ...this.defaultConfig(),
                ...config
            };
        }
    }

    private defaultConfig(): DiBeanConfig {
        return {
            lifetime: "singleton",
            creation: "lazy"
        };
    }

}
