import {
    RenderTargetConfig,
    RenderTargetInputConfig,
    RenderTargetOutputConfig,
} from "../resources/renderTargetRenderResource";
import {TextureConfig, TextureInputConfig} from "../resources/textureRenderResource";
import {VertexDataConfig, VertexDataInputConfig, VertexDataOutputConfig} from "../resources/vertexDataRenderResource";
import {ShaderConfig, ShaderInputConfig} from "../resources/shaderRenderResource";
import {PropertyConfig, PropertyInputConfig} from "../resources/propertyRenderResource";


export interface RenderNodeConfig {
    id: string,
    inputs: RenderNodeInputEntry[],
    outputs: RenderNodeOutputEntry[]
}

export type RenderNodeResourceEntry = RenderTargetConfig
    | TextureConfig
    | VertexDataConfig
    | ShaderConfig
    | PropertyConfig

export type RenderNodeInputEntry = RenderTargetInputConfig
    | TextureInputConfig
    | VertexDataInputConfig
    | ShaderInputConfig
    | PropertyInputConfig

export type RenderNodeOutputEntry = RenderTargetOutputConfig | VertexDataOutputConfig


/**
 * A single node in a render-graph
 */
export abstract class AbstractRenderNode {

    protected readonly config: RenderNodeConfig;

    protected constructor(config: RenderNodeConfig) {
        this.config = config;
    }

    public getConfig(): RenderNodeConfig {
        return this.config;
    }

    public getId(): string {
        return this.config.id;
    }

    public abstract execute(): void;
}