import {AbstractRenderNode, RenderNodeResourceEntry} from "../nodes/abstractRenderNode";
import {RenderGraphCompiler} from "../compiler/renderGraphCompiler";
import {RenderCommand} from "../compiler/renderCommand";
import {RenderContext} from "../context/renderContext";
import {ResourceManager} from "../compiler/resourceManager";
import {VertexDataConfig} from "../resources/vertexDataRenderResource";
import {RenderTargetConfig} from "../resources/renderTargetRenderResource";
import {TextureConfig} from "../resources/textureRenderResource";
import {ShaderConfig} from "../resources/shaderRenderResource";


export abstract class RenderGraph {

    private readonly nodes: AbstractRenderNode[];
    private commands: RenderCommand<RenderContext>[] | null = null;
    private resourceManager: ResourceManager | null = null;

    protected constructor(nodes: AbstractRenderNode[]) {
        this.nodes = nodes;
    }

    public compile(compiler: RenderGraphCompiler<RenderContext>, resourceManager: ResourceManager) {
        this.resourceManager = resourceManager;
        this.commands = compiler.compile(this.nodes);
    }

    public initialize() {
        if (this.resourceManager !== null) {
            this.resourceManager.initialize(this.collectDeclaredResources(this.nodes));
        } else {
            throw new Error("Cannot initialize graph. Graph has not been compiled yet.");
        }
    }

    public execute() {
        if (this.commands !== null && this.resourceManager !== null) {
            for (let i = 0; i < this.commands.length; i++) {
                const command = this.commands[i];
                command.execute(this.resourceManager);
            }
        } else {
            throw new Error("Cannot execute graph. Graph has not been compiled yet.");
        }
    }

    public dispose() {
        if (this.resourceManager !== null) {
            this.resourceManager.dispose();
        } else {
            throw new Error("Cannot dispose graph. Graph has not been compiled yet.");
        }
    }

    private collectDeclaredResources(nodes: AbstractRenderNode[]): RenderNodeResourceEntry[] {
        const entries: RenderNodeResourceEntry[] = [];
        for (let node of nodes) {
            for (let input of node.getConfig().inputs) {
                switch (input.type) {
                    case "vertexdata": {
                        const config = input as VertexDataConfig;
                        if (!entries.some(e => e.type === "vertexdata" && e.name === config.name)) {
                            entries.push(config);
                        }
                        break;
                    }
                    case "render-target": {
                        const config = input as RenderTargetConfig;
                        if (!entries.some(e => e.type === "render-target" && e.name === config.name)) {
                            entries.push(config);
                        }
                        break;
                    }
                    case "texture": {
                        const config = input as TextureConfig;
                        if (!entries.some(e => e.type === "texture" && e.path === config.path)) {
                            entries.push(config);
                        }
                        break;
                    }
                    case "shader": {
                        const config = input as ShaderConfig;
                        if (!entries.some(e => e.type === "shader" && e.vertex === config.vertex && e.fragment === config.fragment)) {
                            entries.push(config);
                        }
                        break;
                    }
                }
            }
        }
        return entries;
    }

}