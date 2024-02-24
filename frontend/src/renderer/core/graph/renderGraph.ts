import {AbstractRenderNode} from "./abstractRenderNode";
import {RenderGraphSorter} from "./renderGraphSorter";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {ResourceManager} from "./resourceManager";
import {RenderCommand} from "./renderCommand";

export class RenderGraph<TContext> {

    private readonly sorter: RenderGraphSorter;
    private readonly resourceManager: ResourceManager;
    private readonly compiler: RenderGraphCompiler<any>;
    private readonly nodes: AbstractRenderNode[];
    private commands: RenderCommand<any, any>[] = [];
    private context: TContext | null = null;

    constructor(props: {
        sorter: RenderGraphSorter,
        resourceManager: ResourceManager,
        compiler: RenderGraphCompiler<any>,
        nodes: AbstractRenderNode[]
    }) {
        this.sorter = props.sorter;
        this.resourceManager = props.resourceManager;
        this.compiler = props.compiler;
        this.nodes = props.nodes;
    }

    public initialize(context: TContext) {
        this.context = context;
        const sortedNodes = this.sorter.sort(this.nodes);
        this.resourceManager.initialize(sortedNodes);
        this.commands = this.compiler.compile(sortedNodes);
    }

    public execute() {
        if(this.context === null) {
            throw new Error("Render graph not initialized.")
        }
        const commands = this.commands;
        const context = this.context;
        const resourceManager = this.resourceManager;
        for (let i = 0, n = commands.length; i < n; i++) {
            const command = commands[i];
            command.execute(resourceManager, context);
        }
    }

    public dispose() {
        this.resourceManager.dispose();
        this.commands = [];
        this.context = null;
    }

}