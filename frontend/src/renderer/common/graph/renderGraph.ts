import {AbstractRenderNode} from "./nodes/abstractRenderNode";
import {RenderGraphSorter} from "./renderGraphSorter";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {ResourceManager} from "./resourceManager";
import {RenderCommand} from "./renderCommand";

/**
 * A graph of render-nodes; edges defined by dependencies of node inputs and outputs.
 */
export class RenderGraph<TContext> {

    private readonly name: string;
    private readonly sorter: RenderGraphSorter;
    private readonly resourceManager: ResourceManager;
    private readonly compiler: RenderGraphCompiler<any>;
    private readonly nodes: RenderNode[];
    private commands: RenderCommand<any, any>[] = [];
    public context: TContext | null = null;

    constructor(props: {
        name: string,
        sorter: RenderGraphSorter,
        resourceManager: ResourceManager,
        compiler: RenderGraphCompiler<any>,
        nodes: RenderNode[]
    }) {
        this.name = props.name;
        this.sorter = props.sorter;
        this.resourceManager = props.resourceManager;
        this.compiler = props.compiler;
        this.nodes = props.nodes;
    }

    public initialize(context: TContext) {
        console.log("Initialize render graph", this.name);
        this.context = context;
        const sortedNodes = this.sorter.sort(this.nodes);
        this.resourceManager.initialize(sortedNodes);
        this.commands = this.compiler.compile(sortedNodes);
    }

    public execute() {
        if (this.context === null) {
            throw new Error("Render graph not initialized " + this.name);
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
        console.log("Dispose render graph", this.name);
        this.resourceManager.dispose();
        this.commands = [];
        this.context = null;
    }

    public updateContext(action: (context: TContext) => TContext) {
        if (this.context) {
            this.context = action(this.context);
        }
    }

}