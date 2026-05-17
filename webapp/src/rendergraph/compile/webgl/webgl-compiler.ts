import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import type {WebGlDrawCallNode} from "@rendergraph/compile/webgl/webgl-draw-call-graph.node.ts";
import {
    WebGlBindFramebufferCommand,
    WebGlBindFramebufferTextureCommand,
    WebGlBindSelectTextureCommand,
    WebGlBindTextureCommand,
    WebGlBindVertexArrayCommand,
    type WebGlCommand,
    WebGlDrawCommand,
    WebGlLoadExternalDataCommand,
    WebGlLoadTransformedDataCommand,
    WebGlSetUniformValuesCommand,
    WebGlTransformCommand,
    WebGlTransformMultiOutCommand,
    WebGlTransformVertexOutCommand,
    WebGlUnbindFramebufferCommand,
    WebGlUseProgramCommand,
} from "@rendergraph/execute/webgl/webgl-command.ts";
import type {ResourceKey} from "@rendergraph/execute/webgl/webgl-execution-context.ts";
import type {RendertargetRenderGraphNode} from "@rendergraph/nodes/rg-node.rendertarget.ts";
import type {CanvasRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas.ts";
import type {DrawRenderGraphNode} from "@rendergraph/nodes/rg-node.draw.ts";
import type {GeometrySource} from "@rendergraph/nodes/rg-node.geometry.ts";
import type {ShaderRenderGraphNode} from "@rendergraph/nodes/rg-node.shader.ts";
import type {
    WebGlFramebufferResource,
    WebGlResource,
    WebGlShaderProgramResource,
    WebGlTextureResource,
    WebGlVertexArrayResource,
    WebGlVertexBufferResource,
} from "@rendergraph/execute/webgl/webgl-resource.ts";
import {type GlAttributeComponentAmount, GlAttributeType} from "@rendergraph/webgl/gl-program.ts";

interface CompileContext {
    nodes: RenderGraphNode[];
    compiledNodes: Set<string>,
    commands: WebGlCommand[];
    resources: WebGlResource[];
}

export function webglCompile(nodes: RenderGraphNode[], sortedDrawCalls: WebGlDrawCallNode[]) {

    const context = {
        nodes: nodes,
        compiledNodes: new Set(),
        commands: [],
        resources: [],
    } satisfies CompileContext;

    sortedDrawCalls.forEach(drawCall => {
        compileNode(drawCall.node, context, true);
    });

}

export function compileNode(node: RenderGraphNode, context: CompileContext, compileDrawNode: boolean) {
    if (node.type === "canvas") {
        context.compiledNodes.add(node.name);
        return;
    }

    if (node.type === "draw" && compileDrawNode) {
        context.compiledNodes.add(node.name);
        compileNode(node.geometry, context, false);
        Object.values(node.inputs).forEach(inputNode => {
            compileNode(inputNode, context, false);
        });
        compileNode(node.shader, context, false);
        context.commands.push(new WebGlSetUniformValuesCommand({
            programResourceKey: keyProgram(node.shader),
            inputs: Object.entries(node.inputs).map(([key, value]) => {
                if (value.type === "data") {
                    return {name: key, source: "data", resourceKey: value.name};
                }
                if (value.type === "texture") {
                    return {name: key, source: "texture", resourceKey: keyTextureConfig(value)};

                }
                if (value.type === "select-texture") {
                    return {name: key, source: "select-texture", resourceKey: "todo"};
                }
                if (value.type === "rendertarget") {
                    return {name: key, source: "framebuffer", resourceKey: value.name};
                }
                throw new Error("Invalid draw call input: " + value);
            }),
        }));


        const requiredRendertarget = findRequiredRendertarget(node, context.nodes);
        const boundFramebufferResourceKey = findBoundRendertarget(context.commands);
        if (requiredRendertarget === null && boundFramebufferResourceKey !== null) {
            context.commands.push(new WebGlUnbindFramebufferCommand());
        }
        if (requiredRendertarget !== null && (boundFramebufferResourceKey !== null || boundFramebufferResourceKey !== requiredRendertarget.name)) {
            context.commands.push(new WebGlBindFramebufferCommand({
                resourceKey: requiredRendertarget.name,
            }));
        }
        context.commands.push(new WebGlDrawCommand());
    }

    if (node.type === "texture") {
        context.compiledNodes.add(node.name);
        context.resources.push({
            type: "texture",
            key: keyTextureConfig(node),
            url: node.url,
            wrap: node.wrap,
            filterMin: node.filterMin,
            filterMag: node.filterMag,
            resource: null,
        } satisfies WebGlTextureResource);
        context.commands.push(new WebGlBindTextureCommand({
            resourceKey: keyTextureConfig(node),
        }));
    }

    if (node.type === "rendertarget") {
        context.compiledNodes.add(node.name);
        context.resources.push({
            type: "framebuffer",
            key: node.name,
            size: "auto",
            color: true,
            depth: false,
            resource: null,
        } satisfies WebGlFramebufferResource);
        context.commands.push(new WebGlBindFramebufferTextureCommand({
            resourceKey: node.name,
        }));
    }

    if (node.type === "shader") {
        context.compiledNodes.add(node.name);
        context.resources.push({
            type: "program",
            key: keyProgram(node),
            srcVertex: node.srcVertex,
            srcFragment: node.srcFragment,
            resource: null,
        } satisfies WebGlShaderProgramResource);
        context.commands.push(new WebGlUseProgramCommand({
            resourceKey: keyProgram(node),
        }));
    }

    if (node.type === "data" && node.source.type === "constant") {
        context.compiledNodes.add(node.name);
        return;
    }

    if (node.type === "data" && node.source.type === "external") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        context.commands.push(new WebGlLoadExternalDataCommand({
            resourceKey: node.name,
            fetchFunc: node.source.fetch,
            hasChangedFunc: undefined,
        }));
    }

    if (node.type === "data" && node.source.type === "transform") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        compileNode(node.source.transformer, context, false);
        context.commands.push(new WebGlLoadTransformedDataCommand({
            resourceKey: node.name,
            transformerResourceKey: node.source.transformer.name,
        }));
    }

    if (node.type === "data" && node.source.type === "transform-multi-out") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        compileNode(node.source.transformer, context, false);
        context.commands.push(new WebGlLoadTransformedDataCommand({
            resourceKey: node.name,
            transformerResourceKey: node.source.transformer.name + "#" + node.source.key,
        }));
    }

    if (node.type === "geometry") {
        context.compiledNodes.add(node.name);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.sources as GeometrySource<any>[]).forEach(source => {
            compileNode(source.source, context, false);
        });
        const attributes: ({
            bufferResourceKey: ResourceKey,
            name: string,
            type: GlAttributeType
            amountComponents: GlAttributeComponentAmount
            normalized: boolean | undefined
            stride: number | undefined
            offset: number | undefined
            divisor: number | undefined
        })[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.sources as GeometrySource<any>[]).forEach(source => {
            const bufferLayout = source.source.outputs[source.output];
            bufferLayout.forEach(entry => {
                attributes.push({
                    bufferResourceKey: source.source.name + "#" + source.output,
                    name: entry.name,
                    type: entry.type,
                    amountComponents: entry.amountComponents,
                    normalized: entry.normalized,
                    stride: entry.stride,
                    offset: entry.offset,
                    divisor: entry.divisor,
                });
            });
        });
        context.resources.push({
            type: "vertexarray",
            key: node.name,
            attributes: attributes,
            resource: null,
        } satisfies WebGlVertexArrayResource);
        context.commands.push(new WebGlBindVertexArrayCommand({
            resourceKey: node.name,
        }));
    }

    if (node.type === "select-texture") {
        context.compiledNodes.add(node.name);
        context.commands.push(new WebGlBindSelectTextureCommand({
            resourceKey: node.name,
            inputResourceKey: node.input.name,
            selectorFunc: node.selector,
            options: Object.entries(node.options).reduce(
                (acc, [key, textureNode]) => ({...acc, [key]: keyTextureConfig(textureNode)}),
                {} as Record<string, string>,
            ),
        }));
    }

    if (node.type === "transform") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        Object.values(node.inputs).forEach(inputNode => {
            compileNode(inputNode, context, false);
        });
        context.commands.push(new WebGlTransformCommand({
            resourceKey: node.name,
            inputs: node.inputs.map(it => it.name),
            transformFunc: node.func,
        }));
    }

    if (node.type === "transform-multi-out") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        context.commands.push(new WebGlTransformMultiOutCommand({
            resourceKey: node.name,
            inputs: node.inputs.map(it => it.name),
            transformFunc: node.func,
        }));
    }

    if (node.type === "transform-vertex-out") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        Object.entries(node.outputs).forEach(([key]) => {
            context.resources.push({
                type: "vertexbuffer",
                key: node.name + "#" + key,
                resource: null,
            } satisfies WebGlVertexBufferResource);
        });
        context.commands.push(new WebGlTransformVertexOutCommand({
            resourceKey: node.name,
            inputs: node.inputs.map(it => it.name),
            transformFunc: node.func,
        }));
    }
}


function findRequiredRendertarget(drawNode: DrawRenderGraphNode, nodes: RenderGraphNode[]): RendertargetRenderGraphNode | CanvasRenderGraphNode | null {
    let requiredRendertarget: RendertargetRenderGraphNode | CanvasRenderGraphNode | null = null;
    for (const otherNode of nodes) {
        if (otherNode.type === "canvas") {
            if (otherNode.renderPasses.includes(drawNode)) {
                requiredRendertarget = otherNode;
                break;
            }
        }
        if (otherNode.type === "rendertarget") {
            if (otherNode.renderPasses.includes(drawNode)) {
                requiredRendertarget = otherNode;
                break;
            }
        }
    }
    return requiredRendertarget;
}


function findBoundRendertarget(commands: WebGlCommand[]): ResourceKey | null {
    let boundFramebufferResourceKey: ResourceKey | null = null;
    for (let i = commands.length - 1; i >= 0; i--) {
        const command = commands[i];
        if (command instanceof WebGlBindFramebufferCommand) {
            boundFramebufferResourceKey = command.resourceKey;
            break;
        }
        if (command instanceof WebGlUnbindFramebufferCommand) {
            boundFramebufferResourceKey = null;
            break;
        }
    }
    return boundFramebufferResourceKey;
}


function keyTextureConfig(texture: { url: string, wrap: string, filterMin: string, filterMag: string }): ResourceKey {
    const textureStr = `${texture.url}|${texture.wrap}|${texture.filterMin}|${texture.filterMag}`;
    return keyString(textureStr);
}

function keyProgram(node: ShaderRenderGraphNode): ResourceKey {
    return keyString(node.srcVertex + "|" + node.srcFragment);
}

function keyString(str: string): ResourceKey {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}