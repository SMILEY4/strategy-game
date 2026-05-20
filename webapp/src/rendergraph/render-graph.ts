import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import {sortWebGlDrawCallNodes} from "@rendergraph/compile/webgl/webgl-draw-call-graph.sorter.ts";
import {buildWebglDrawCallGraph} from "@rendergraph/compile/webgl/webgl-draw-call-graph.builder.ts";
import {webglCompile} from "@rendergraph/compile/webgl/webgl-compiler.ts";
import type {WebGlCommand} from "@rendergraph/execute/webgl/webgl-command.ts";
import {WebglExecutionContext, type WebglExecutionContextFactory} from "@rendergraph/execute/webgl/webgl-execution-context.ts";

export interface RenderGraph {
    setCanvas(canvas: HTMLCanvasElement | null): void;
    execute(): void;
}

export class WebGlRenderGraph implements RenderGraph {

    public static build(nodes: RenderGraphNode[]) {
        const drawCalls = buildWebglDrawCallGraph(nodes);
        const sortedDrawCalls = sortWebGlDrawCallNodes(drawCalls, WebGL2RenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        const {commands, resources} = webglCompile(nodes, sortedDrawCalls);
        return new WebGlRenderGraph(commands, canvas => WebglExecutionContext.build(canvas, resources));
    }


    private readonly commands: WebGlCommand[];
    private readonly executionContextFactory: WebglExecutionContextFactory;

    private executionContext: WebglExecutionContext | null = null;


    private constructor(commands: WebGlCommand[], executionContextFactory: WebglExecutionContextFactory) {
        this.commands = commands;
        this.executionContextFactory = executionContextFactory;
    }

    public setCanvas(canvas: HTMLCanvasElement | null) {
        if (canvas) {
            this.executionContext = this.executionContextFactory(canvas);
        } else {
            this.executionContext = null;
        }
    }

    public execute() {
        if (!this.executionContext) {
            return;
        }
        this.executionContext.clearAllDirty();
        const commandsLocal = this.commands;
        for (let i = 0, n = commandsLocal.length; i < n; i++) {
            const command = commandsLocal[i];
            command.execute(this.executionContext);
        }
    }

}