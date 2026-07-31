import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";
import {sortWebGlDrawCallNodes} from "@modules/rendergraph/compile/webgl/webgl-draw-call-graph.sorter.ts";
import {buildWebglDrawCallGraph} from "@modules/rendergraph/compile/webgl/webgl-draw-call-graph.builder.ts";
import type {WebGlCommand} from "@modules/rendergraph/compile/webgl/webgl-command.ts";
import {webglCompile} from "@modules/rendergraph/compile/webgl/webgl-compiler.ts";
import {WebGlExecutionContext, type WebglExecutionContextFactory} from "@modules/rendergraph/execute/webgl/webgl-execution-context.ts";
import {executeWebGlCommands} from "@modules/rendergraph/execute/webgl/webg-command-executor.ts";
import {KEY_CANVAS_SIZE} from "@modules/rendergraph/execute/webgl/webgl-constants.ts";

/** Compiled render graph that executes draw commands against a WebGL canvas. */
export interface RenderGraph {
    initializeCanvas(canvas: HTMLCanvasElement | null): void;
    execute(): void;
}

/** WebGL2 implementation of [RenderGraph]. Compiled once and executed per frame. */
export class WebGlRenderGraph implements RenderGraph {

    public static build(nodes: RenderGraphNode[]): WebGlRenderGraph {
        const drawCalls = buildWebglDrawCallGraph(nodes);
        const sortedDrawCalls = sortWebGlDrawCallNodes(drawCalls, WebGL2RenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        const {commands, resources} = webglCompile(nodes, sortedDrawCalls, WebGL2RenderingContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        return new WebGlRenderGraph(commands, canvas => WebGlExecutionContext.build(canvas, resources));
    }


    private readonly commands: WebGlCommand[];
    private readonly executionContextFactory: WebglExecutionContextFactory;

    private executionContext: WebGlExecutionContext | null = null;


    private constructor(commands: WebGlCommand[], executionContextFactory: WebglExecutionContextFactory) {
        this.commands = commands;
        this.executionContextFactory = executionContextFactory;
    }

    public initializeCanvas(canvas: HTMLCanvasElement | null) {
        this.dispose()
        if (canvas) {
            this.executionContext = this.executionContextFactory(canvas);
            this.executionContext.setData(KEY_CANVAS_SIZE, [canvas.width, canvas.height])
            this.executionContext.setAllDirty(true)
        } else {
            this.executionContext = null;
        }
    }

    public onResizeCanvas(canvas: HTMLCanvasElement | null) {
        if(this.executionContext && canvas) {
            this.executionContext.setData(KEY_CANVAS_SIZE, [canvas.width, canvas.height])
            this.executionContext.setDirty(KEY_CANVAS_SIZE)
        }
    }

    public execute() {
        if (!this.executionContext) {
            return;
        }
        executeWebGlCommands(this.commands, this.executionContext);
        this.executionContext.setAllDirty(false);
    }

    public dispose() {
        if (!this.executionContext) {
            return;
        }
        this.executionContext.dispose();
        this.executionContext = null;
    }

    public getExecutionContext(): WebGlExecutionContext | null {
        return this.executionContext
    }

}