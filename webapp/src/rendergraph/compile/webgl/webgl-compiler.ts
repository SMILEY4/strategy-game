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
    WebGlLockTextureCommand,
    WebGlSetUniformValuesCommand,
    WebGlTransformCommand,
    WebGlTransformMultiOutCommand,
    WebGlTransformVertexOutCommand,
    WebGlUnbindFramebufferCommand,
    WebGlUpdatePerspectiveCameraCommand,
    WebGlUseProgramCommand,
} from "@rendergraph/execute/webgl/webgl-command.ts";
import type {RendertargetRenderGraphNode} from "@rendergraph/nodes/rg-node.rendertarget.ts";
import type {CanvasRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas.ts";
import type {DrawRenderGraphNode} from "@rendergraph/nodes/rg-node.draw.ts";
import type {GeometrySource} from "@rendergraph/nodes/rg-node.geometry.ts";
import type {ShaderRenderGraphNode} from "@rendergraph/nodes/rg-node.shader.ts";
import type {
    WebGlDataResource,
    WebGlFramebufferResource,
    WebGlProgramResource,
    WebGlResource,
    WebGlTextureResource,
    WebGlVertexArrayResource,
    WebGlVertexBufferResource,
} from "@rendergraph/execute/webgl/webgl-resource.ts";
import {type GlAttributeComponentAmount, GlAttributeType} from "@rendergraph/webgl/gl-program.ts";
import type {ResourceKey} from "@rendergraph/execute/resource-key.ts";
import {checkExhaustive} from "@/common/common.ts";
import { vec3} from "gl-matrix";

interface CompileContext {
    nodes: RenderGraphNode[];
    compiledNodes: Set<string>,
    commands: WebGlCommand[];
    resources: WebGlResource[];
}

export function webglCompile(nodes: RenderGraphNode[], sortedDrawCalls: WebGlDrawCallNode[]): {
    commands: WebGlCommand[],
    resources: WebGlResource[]
} {

    const context: CompileContext = {
        nodes: nodes,
        compiledNodes: new Set(),
        commands: [],
        resources: [],
    };

    sortedDrawCalls.forEach(drawCall => {
        context.commands.push(new WebGlLockTextureCommand({
            resourceKeys: [
                ...drawCall.requiresResources.textures.map(node => {
                    if (node.type === "texture") {
                        return keyTextureConfig(node);
                    }
                    if (node.type === "rendertarget") {
                        return node.name;
                    }
                    checkExhaustive(node);
                }),
                ...drawCall.requiresResources.texturesSelect.flatMap(node => {
                    return Object.values(node.options).map(it => keyTextureConfig(it));
                }),
            ],
        }));
        compileNode(drawCall.node, context, true);
    });

    return {commands: context.commands, resources: context.resources};
}

export function compileNode(node: RenderGraphNode, context: CompileContext, compileDrawNode: boolean) {
    if (node.type === "canvas") {
        context.compiledNodes.add(node.name);
        return;
    }

    if (node.type === "draw") {
        if (!compileDrawNode) return;
        context.compiledNodes.add(node.name);

        compileNode(node.geometry, context, false);

        Object.values(node.inputs).forEach(inputNode => {
            if (inputNode.type === "data" && inputNode.source.type === "constant") return; // skip constants -> value is inlined
            compileNode(inputNode, context, false);
        });

        compileNode(node.shader, context, false);

        context.commands.push(new WebGlSetUniformValuesCommand({
            programResourceKey: keyProgram(node.shader),
            inputs: Object.entries(node.inputs).map(([key, value]) => {
                if (value.type === "data") {
                    if (value.source.type === "constant") {
                        return {name: node.shader.prefixUniforms + key, source: "data-const", value: value.source.value};
                    } else {
                        return {name: node.shader.prefixUniforms + key, source: "data", resourceKey: value.name};
                    }
                }
                if (value.type === "texture") {
                    return {name: node.shader.prefixUniforms + key, source: "texture", resourceKey: keyTextureConfig(value)};

                }
                if (value.type === "select-texture") {
                    return {name: node.shader.prefixUniforms + key, source: "select-texture", resourceKey: "todo"}; // todo
                }
                if (value.type === "rendertarget") {
                    return {name: node.shader.prefixUniforms + key, source: "framebuffer", resourceKey: value.name};
                }
                if (value.type === "camera") { // todo
                    return {name: node.shader.prefixUniforms + key, source: "data", resourceKey: value.name + "#viewproj"};
                }
                checkExhaustive(value);
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

        const vertexBufferResourceKeys: ResourceKey[] = [];
        const instanceBufferResourceKeys: ResourceKey[] = [];
        (node.geometry.sources as GeometrySource<string>[]).forEach(source => {
            const contentType = source.source.outputs[source.source.name].content;
            if (contentType === "vertices") {
                vertexBufferResourceKeys.push(keyGeometrySource(source));
            }
            if (contentType === "instances") {
                instanceBufferResourceKeys.push(keyGeometrySource(source));
            }
        });

        context.commands.push(new WebGlDrawCommand({
            vertexBufferResourceKeys: vertexBufferResourceKeys,
            instanceBufferResourceKeys: instanceBufferResourceKeys,
        }));
        return;
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
        return;
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
        return;
    }

    if (node.type === "shader") {
        context.compiledNodes.add(node.name);
        context.resources.push({
            type: "program",
            key: keyProgram(node),
            srcVertex: node.srcVertex,
            srcFragment: node.srcFragment,
            prefixVertexAttributes: node.prefixVertexAttributes ?? "",
            prefixUniforms: node.prefixUniforms ?? "",
            resource: null,
        } satisfies WebGlProgramResource);
        context.commands.push(new WebGlUseProgramCommand({
            resourceKey: keyProgram(node),
        }));
        return;
    }

    if (node.type === "data") {

        context.resources.push({
            type: "data",
            key: node.name,
            resource: undefined,
        } satisfies WebGlDataResource);

        if (node.source.type === "constant") {
            context.compiledNodes.add(node.name);
            return;
        }

        if (node.source.type === "external") {
            if (context.compiledNodes.has(node.name)) return;
            context.compiledNodes.add(node.name);
            context.commands.push(new WebGlLoadExternalDataCommand({
                resourceKey: node.name,
                fetchFunc: node.source.fetch,
                hasChangedFunc: undefined,
            }));
            return;
        }

        if (node.source.type === "transform") {
            if (context.compiledNodes.has(node.name)) return;
            context.compiledNodes.add(node.name);
            compileNode(node.source.transformer, context, false);
            context.commands.push(new WebGlLoadTransformedDataCommand({
                resourceKey: node.name,
                transformerResourceKey: node.source.transformer.name,
            }));
            return;
        }

        if (node.source.type === "transform-multi-out") {
            if (context.compiledNodes.has(node.name)) return;
            context.compiledNodes.add(node.name);
            compileNode(node.source.transformer, context, false);
            context.commands.push(new WebGlLoadTransformedDataCommand({
                resourceKey: node.name,
                transformerResourceKey: node.source.transformer.name + "#" + node.source.key,
            }));
            return;
        }

        checkExhaustive(node.source);
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
            normalized: boolean | undefined,
            divisor: number
        })[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.sources as GeometrySource<any>[]).forEach(source => {
            const bufferContent = source.source.outputs[source.output].content;
            const bufferLayout = source.source.outputs[source.output].layout;
            bufferLayout.forEach(entry => {
                attributes.push({
                    bufferResourceKey: keyGeometrySource(source),
                    name: entry.name,
                    type: entry.type,
                    amountComponents: entry.amountComponents,
                    normalized: entry.normalized,
                    divisor: bufferContent === "vertices" ? 0 : 1,
                });
            });
        });
        const drawNode = context.nodes.find(it => it.type === "draw" && it.geometry === node) as DrawRenderGraphNode;
        context.resources.push({
            type: "vertexarray",
            key: node.name,
            attributes: attributes,
            programResourceKey: keyProgram(drawNode.shader),
            resource: null,
        } satisfies WebGlVertexArrayResource);
        context.commands.push(new WebGlBindVertexArrayCommand({
            resourceKey: node.name,
        }));
        return;
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
        return;
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
        return;
    }

    if (node.type === "transform-multi-out") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);
        context.commands.push(new WebGlTransformMultiOutCommand({
            resourceKey: node.name,
            inputs: node.inputs.map(it => it.name),
            transformFunc: node.func,
        }));
        return;
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
        return;
    }

    if (node.type === "camera") {
        if (context.compiledNodes.has(node.name)) return;
        context.compiledNodes.add(node.name);

        if (node.data.type === "perspective") {

            if(node.data.up.source.type !== "constant") compileNode(node.data.up, context, false)
            if(node.data.position.source.type !== "constant") compileNode(node.data.position, context, false)
            if(node.data.direction.source.type !== "constant") compileNode(node.data.direction, context, false)
            if(node.data.fov.source.type !== "constant") compileNode(node.data.fov, context, false)
            if(node.data.near.source.type !== "constant") compileNode(node.data.near, context, false)
            if(node.data.far.source.type !== "constant") compileNode(node.data.far, context, false)

            context.resources.push({type: "data", key: node.name + "#proj", resource: undefined} satisfies WebGlDataResource);
            context.resources.push({type: "data", key: node.name + "#view", resource: undefined} satisfies WebGlDataResource);
            context.resources.push({type: "data", key: node.name + "#viewproj", resource: undefined} satisfies WebGlDataResource);

            context.commands.push(new WebGlUpdatePerspectiveCameraCommand({
                resourceKey: node.name,
                up: {type: "ref", key: node.data.up.name},
                position: node.data.position.source.type === "constant"
                    ? {type: "const", value: vec3.fromValues(node.data.position.source.value[0], node.data.position.source.value[1], node.data.position.source.value[2])}
                    : {type: "ref", key: node.data.position.name},
                direction: node.data.direction.source.type === "constant"
                    ? {type: "const", value: vec3.fromValues(node.data.direction.source.value[0], node.data.direction.source.value[1], node.data.direction.source.value[2])}
                    : {type: "ref", key: node.data.direction.name},
                aspect: null, // todo
                fov: node.data.fov.source.type === "constant"
                    ? {type: "const", value: node.data.fov.source.value }
                    : {type: "ref", key: node.data.fov.name},
                near: node.data.near.source.type === "constant"
                    ? {type: "const", value: node.data.near.source.value }
                    : {type: "ref", key: node.data.near.name},
                far: node.data.far.source.type === "constant"
                    ? {type: "const", value: node.data.far.source.value }
                    : {type: "ref", key: node.data.far.name},
            }));
            return;
        }

        if (node.data.type === "orthographic") {
            // todo
            return;
        }

        if (node.data.type === "2d") {
            // todo
            return;
        }

        checkExhaustive(node.data);
    }

    checkExhaustive(node);
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

function keyGeometrySource(source: GeometrySource<string>): ResourceKey {
    return source.source.name + "#" + source.output;
}

function keyString(str: string): ResourceKey {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    hash = Math.abs(hash);
    return hash.toString(16);
}