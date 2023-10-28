import {GameRenderer} from "../logic/renderer/gameRenderer";
import {CanvasHandle} from "../logic/game/canvasHandle";

interface DIObjectConfig {
    /**
     * singleton: object is created once and reused (default)
     * transient: object is created every time it is requested
     */
    lifetime: "singleton" | "transient";
    /**
     * eager: object is created at start (makes only sense with "singleton")
     * lazy: object is created the first time it is requested (default)
     */
    creation: "eager" | "lazy";
}

export class DIContext {

    private readonly definitions = new Map<string, { factory: (ctx: DIContext) => any, config: DIObjectConfig }>();
    private readonly entries = new Map<string, any>();

    public register<T>(qualifier: string, factory: (ctx: DIContext) => T, config?: DIObjectConfig): () => T {
        this.definitions.set(qualifier, {
            factory: factory,
            config: {
                lifetime: "singleton",
                creation: "lazy",
                ...config,
            },
        });
        return () => this.get<T>(qualifier);
    }

    public initialize() {
        this.definitions.forEach((definition, qualifier) => {
            if (definition.config.creation === "eager") {
                this.get(qualifier);
            }
        });
    }

    public get<T>(qualifier: string): T {
        const definition = this.definitions.get(qualifier);
        if (definition) {
            if (definition.config.lifetime === "singleton") {
                const existing = this.entries.get(qualifier);
                if (existing === null || existing === undefined) {
                    const entry = definition.factory(this);
                    this.entries.set(qualifier, entry);
                    return entry;
                } else {
                    return existing;
                }
            } else {
                return definition.factory(this);
            }
        } else {
            throw new Error("No definition for qualifier " + qualifier);
        }
    }

}

const ctx = new DIContext();

export const DI: any = {
    GameRenderer: ctx.register(
        "GameRenderer",
        () => new GameRenderer(DI.CanvasHandle()),
    ),
    CanvasHandle: ctx.register(
        "CanvasHandle",
        () => new CanvasHandle(),
    ),
};

ctx.initialize();
