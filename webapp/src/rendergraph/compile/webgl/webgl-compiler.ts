import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import type {WebGlDrawCallNode} from "@rendergraph/compile/webgl/webgl-draw-call-graph.node.ts";
import type {DrawRenderGraphNode} from "@rendergraph/nodes/rg-node.draw.ts";
import type {ShaderRenderGraphNode} from "@rendergraph/nodes/rg-node.shader.ts";
import type {GeometryRenderGraphNode, GeometrySource} from "@rendergraph/nodes/rg-node.geometry.ts";
import type {RendertargetRenderGraphNode} from "@rendergraph/nodes/rg-node.rendertarget.ts";
import type {CanvasRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas.ts";
import type {TextureRenderGraphNode} from "@rendergraph/nodes/rg-node.texture.ts";
import type {SelectTextureRenderGraphNode} from "@rendergraph/nodes/rg-node.select-texture.ts";
import type {CameraRenderGraphNode} from "@rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {TransformRenderGraphNode} from "@rendergraph/nodes/rg-node.transform.ts";
import {assertExhaustive} from "@/common/common.ts";
import type {TransformMultiOutRenderGraphNode} from "@rendergraph/nodes/rg-node.transform-multi-out.ts";
import type {vec3} from "gl-matrix";
import type {CanvasSizeRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas-size.ts";
import type {TransformVertexOutRenderGraphNode, VertexDataResult} from "@rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {WebGlResource, WebGlVertexArrayAttributeResource} from "@rendergraph/execute/webgl/webgl-resource.ts";

export type WebGlCommand =
    | { type: "USE_SHADER", id: string }
    | { type: "BIND_FRAMEBUFFER", id: string }
    | { type: "UNBIND_FRAMEBUFFER" }
    | { type: "RESIZE_FRAMEBUFFER", id: string, refSize: string }
    | { type: "BIND_VAO", id: string }
    | { type: "BIND_TEXTURE", id: string, unit: number }
    | { type: "BIND_TEXTURE_REF", idRef: string, unit: number }
    | { type: "BIND_TEXTURE_FRAMEBUFFER", id: string, unit: number }
    | { type: "SET_UNIFORM", programId: string, name: string, value: ValueEntry }
    | { type: "SET_DEPTH_TESTING", enabled: boolean }
    | { type: "DRAW", refVertexCount: string }
    | { type: "DRAW_INSTANCED", refVertexCount: string, refInstanceCount: string }
    | { type: "LOAD_EXTERNAL_DATA", ref: string, func: () => unknown, checkChanged: (prev: unknown) => boolean }
    | { type: "TRANSFORM_DATA", args: ValueEntry[], refOut: string, func: (args: unknown[]) => unknown | null }
    | { type: "TRANSFORM_DATA_MULTI_OUT", args: ValueEntry[], refOut: string, func: (args: unknown[]) => Record<string, unknown | null> } // todo: better "no result" type
    | {
    type: "TRANSFORM_DATA_VERTEX_OUT",
    args: ValueEntry[],
    refOut: string,
    func: (args: unknown[]) => Record<string, VertexDataResult | null>
} // todo: better "no result" type
    | { type: "SELECT_TEXTURE", args: ValueEntry[], refOut: string, func: (args: unknown) => string }
    | {
    type: "CALCULATE_PERSPECTIVE_PROJECTION",
    ref: string,
    size: ValueEntry<[number, number]>,
    fov: ValueEntry<number>,
    near: ValueEntry<number>,
    far: ValueEntry<number>
}
    | {
    type: "CALCULATE_ORTHOGRAPHIC_PROJECTION",
    ref: string,
    size: ValueEntry<[number, number]>,
    near: ValueEntry<number>,
    far: ValueEntry<number>
}
    | { type: "CALCULATE_3D_VIEW", ref: string, up: ValueEntry<vec3>, position: ValueEntry<vec3>, direction: ValueEntry<vec3> }
    | { type: "CALCULATE_VIEW_PROJECTION", ref: string, refProjection: string, refView: string }
    | { type: "SET_VIEWPORT", size: ValueEntry<[number, number]> }
    | { type: "CLEAR_BUFFER", clearColor: ValueEntry<[number, number, number, number]> }


export type ValueEntry<T = unknown> = { type: "const", value: T } | { type: "ref", ref: string }

interface CompileContext {
    commands: WebGlCommand[],
    resources: WebGlResource[]
    activeShader: ShaderRenderGraphNode | null,
    activeGeometry: GeometryRenderGraphNode | null,
    activeRenderTarget: RendertargetRenderGraphNode | CanvasRenderGraphNode | null,
    relevantVisitedNodeIds: Set<string>;
    textureUnits: (string | null)[]
}

export function webglCompile(nodes: RenderGraphNode[], sortedDrawCalls: WebGlDrawCallNode[], availableTextureUnits: number) {

    const context: CompileContext = {
        commands: [],
        resources: [],
        activeShader: null,
        activeRenderTarget: null,
        activeGeometry: null,
        relevantVisitedNodeIds: new Set<string>(),
        textureUnits: new Array(availableTextureUnits).map(_ => null),
    };

    const drawCallInfos = sortedDrawCalls.map(drawCall => {
        const drawNode = drawCall.node;
        return collectDrawCallInfo(drawNode, nodes);
    });

    context.resources.push({
        type: "data",
        key: "rg-internal:canvas-size",
        resource: null,
    });

    drawCallInfos.forEach(drawCallInfo => {
        compileDrawCallInfo(drawCallInfo, context);
    });

    console.log("compiled render graph:", context.commands.length, "commands and", context.resources.length, "resources")

    return {
        commands: context.commands,
        resources: context.resources,
    }
}

function compileDrawCallInfo(drawCallInfo: DrawCallInfo, context: CompileContext) {

    // switch and prepare framebuffer
    if (context.activeRenderTarget !== drawCallInfo.renderTarget) {
        context.activeRenderTarget = drawCallInfo.renderTarget;
        if (drawCallInfo.renderTarget.type === "canvas") {
            switchToCanvasRenderTarget(drawCallInfo.renderTarget, context);
        }
        if (drawCallInfo.renderTarget.type === "rendertarget") {
            switchToOffscreenRenderTarget(drawCallInfo.renderTarget, context);
        }
    }

    // switch shader program
    if (context.activeShader !== drawCallInfo.shader) {
        context.activeShader = drawCallInfo.shader;
        switchProgram(drawCallInfo.shader, context);
    }

    // switch vertex array
    if (context.activeGeometry !== drawCallInfo.geometry) {
        context.activeGeometry = drawCallInfo.geometry;
        bindVAO(drawCallInfo.geometry, drawCallInfo.shader, context);
    }


    // bind textures and set sampler uniforms
    const requiredTextureIds = [
        ...drawCallInfo.uniforms.textures.map(it => it.node.id),
        ...drawCallInfo.uniforms.renderTargetTextures.map(it => it.node.id),
        ...drawCallInfo.uniforms.selectTextures.map(it => it.node.id),
    ];
    drawCallInfo.uniforms.textures.forEach(entry => {
        setUniformTexture(entry.node, entry.name, requiredTextureIds, context);
    });
    drawCallInfo.uniforms.renderTargetTextures.forEach(entry => {
        setUniformFramebufferTexture(entry.node, entry.name, requiredTextureIds, context);
    });
    drawCallInfo.uniforms.selectTextures.forEach(entry => {
        setUniformSelectTexture(entry.node, entry.name, requiredTextureIds, context);
    });

    // set generic uniform values
    drawCallInfo.uniforms.generic.forEach(entry => {
        if (entry.node.type === "data") {
            setUniformGeneric(entry.node, entry.name, context);
            return;
        }
        if (entry.node.type === "canvas-size") {
            setUniformCanvasSize(entry.node, entry.name, context);
            return;
        }
        if (entry.node.type === "camera") {
            setUniformCamera(entry.node, entry.name, context);
            return;
        }
        assertExhaustive(entry.node);
    });

    // draw call
    generateDrawCall(drawCallInfo.geometry, context);
}

function switchToCanvasRenderTarget(canvas: CanvasRenderGraphNode, context: CompileContext) {
    context.commands.push({type: "UNBIND_FRAMEBUFFER"});
    context.commands.push({type: "SET_VIEWPORT", size: {type: "ref", ref: "rg-internal:canvas-size"}});
    if(canvas.clearColor) {
        context.commands.push({type: "CLEAR_BUFFER", clearColor: {type: "const", value: canvas.clearColor}});
    }
    context.commands.push({type: "SET_DEPTH_TESTING", enabled: canvas.depthTesting })
}


function switchToOffscreenRenderTarget(node: RendertargetRenderGraphNode, context: CompileContext) {

    ifNotYetVisited(node, context, () => {
        context.resources.push({
            type: "framebuffer",
            key: node.id,
            initialSize: (node.size.type === "data" && node.size.source.type === "constant")
                ? node.size.source.value
                : [1, 1],
            color: node.colorBuffer,
            depth: node.depthBuffer,
            resource: null,
        });
    });

    context.commands.push({type: "BIND_FRAMEBUFFER", id: node.id});

    if (node.size.type === "canvas-size") {
        context.commands.push({type: "RESIZE_FRAMEBUFFER", id: node.id, refSize: node.size.id});
        context.commands.push({type: "SET_VIEWPORT", size: {type: "ref", ref: node.size.id}});
    }
    if (node.size.type === "data") {
        const dataResult = resolveDataNode(node.size, context) as ValueEntry<[number, number]>;
        if (dataResult.type === "ref") {
            context.commands.push({type: "RESIZE_FRAMEBUFFER", id: node.id, refSize: dataResult.ref});
        }
        context.commands.push({type: "SET_VIEWPORT", size: dataResult});
    }

    if(node.clearColor) {
        context.commands.push({type: "CLEAR_BUFFER", clearColor: {type: "const", value: node.clearColor}});
    }
    context.commands.push({type: "SET_DEPTH_TESTING", enabled: node.depthTesting })

}


function switchProgram(node: ShaderRenderGraphNode, context: CompileContext) {
    ifNotYetVisited(node, context, () => {
        context.resources.push({
            type: "program",
            key: node.id,
            srcVertex: node.srcVertex,
            srcFragment: node.srcFragment,
            resource: null,
        });
    });
    context.commands.push({type: "USE_SHADER", id: node.id});
}

function setUniformTexture(node: TextureRenderGraphNode, bindAs: string, lockedTextureIds: string[], context: CompileContext) {
    ifNotYetVisited(node, context, () => {
        context.resources.push({
            type: "texture",
            key: node.id,
            url: node.url,
            wrap: node.wrap,
            filterMin: node.filterMin,
            filterMag: node.filterMag,
            resource: null,
        });
    });
    const {unit, alreadyBound} = findTextureUnit(node.id, lockedTextureIds, context);
    if (!alreadyBound) {
        context.commands.push({type: "BIND_TEXTURE", id: node.id, unit: unit});
    }
    context.commands.push({
        type: "SET_UNIFORM",
        programId: context.activeShader!.id,
        name: (context.activeShader?.prefixUniforms ?? "") + bindAs,
        value: { type: "const", value: unit },
    });
}

function setUniformFramebufferTexture(node: RendertargetRenderGraphNode, bindAs: string, lockedTextureIds: string[], context: CompileContext) {
    const {unit, alreadyBound} = findTextureUnit(node.id, lockedTextureIds, context);
    if (!alreadyBound) {
        context.commands.push({type: "BIND_TEXTURE_FRAMEBUFFER", id: node.id, unit: unit});
    }
    context.commands.push({
        type: "SET_UNIFORM",
        programId: context.activeShader!.id,
        name: (context.activeShader?.prefixUniforms ?? "") + bindAs,
        value: { type: "const", value: unit },
    });
}

function setUniformSelectTexture(node: SelectTextureRenderGraphNode<unknown[], string>, bindAs: string, lockedTextureIds: string[], context: CompileContext) {

    ifNotYetVisited(node, context, () => {
        const args = node.inputs.map(inputNode => resolveDataNode(inputNode, context));
        context.commands.push({type: "SELECT_TEXTURE", args: args, func: node.selector, refOut: node.id});
        context.resources.push({
            type: "data",
            key: node.id,
            resource: null,
        });
    });

    // select textures always need to be bound -> id of the select node might already have a unit, but the selected texture is different
    const {unit} = findTextureUnit(node.id, lockedTextureIds, context);
    context.commands.push({type: "BIND_TEXTURE_REF", idRef: node.id, unit: unit});
    context.commands.push({
        type: "SET_UNIFORM",
        programId: context.activeShader!.id,
        name: (context.activeShader?.prefixUniforms ?? "") + bindAs,
        value: { type: "const", value: unit },
    });
}

function setUniformGeneric(node: DataRenderGraphNode<unknown>, bindAs: string, context: CompileContext) {
    const dataResult = resolveDataNode(node, context);
    context.commands.push({
        type: "SET_UNIFORM",
        programId: context.activeShader!.id,
        name: (context.activeShader?.prefixUniforms ?? "") + bindAs,
        value: dataResult,
    });
}

function setUniformCanvasSize(node: CanvasSizeRenderGraphNode, bindAs: string, context: CompileContext) {
    const dataResult = resolveCanvasSize(node, context);
    context.commands.push({
        type: "SET_UNIFORM",
        programId: context.activeShader!.id,
        name: (context.activeShader?.prefixUniforms ?? "") + bindAs,
        value: dataResult
    });
}

function setUniformCamera(node: CameraRenderGraphNode, bindAs: string, context: CompileContext) {
    const refData = updateAndResolveCamera(node, context);
    context.commands.push({
        type: "SET_UNIFORM",
        programId: context.activeShader!.id,
        name: (context.activeShader?.prefixUniforms ?? "") + bindAs,
        value: { type: "ref", ref: refData + "#viewproj" }
    });
}

function generateDrawCall(geometry: GeometryRenderGraphNode, context: CompileContext) {
    let vertexCountRef: string | null = null;
    let instanceCountRef: string | null = null;
    geometry.sources.forEach(source => {
        const transformer = source.source;
        const out = transformer.outputs[source.output];
        if (out.content === "vertices") {
            vertexCountRef = transformer.id + "#" + source.output;
        }
        if (out.content === "instances") {
            instanceCountRef = transformer.id + "#" + source.output;
        }
    });
    if (vertexCountRef !== null && instanceCountRef === null) {
        context.commands.push({type: "DRAW", refVertexCount: vertexCountRef});
    }
    if (vertexCountRef !== null && instanceCountRef !== null) {
        context.commands.push({type: "DRAW_INSTANCED", refVertexCount: vertexCountRef, refInstanceCount: instanceCountRef});
    }
}

/**
 * @return the "ref" to the resource holding the actual value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDataNode(node: DataRenderGraphNode<any>, context: CompileContext): ValueEntry {
    if (node.source.type === "constant") {
        return {type: "const", value: node.source.value};
    }
    if (node.source.type === "external") {
        return resolveDataNodeExternal(node, context);
    }
    if (node.source.type === "transform") {
        return resolveDataNodeTransform(node, context);
    }
    if (node.source.type === "transform-multi-out") {
        return resolveDataNodeTransformMultiOut(node, context);
    }
    assertExhaustive(node.source);
}

/**
 * @return the "ref" to the resource holding the actual value
 */
function resolveDataNodeExternal(node: DataRenderGraphNode<unknown>, context: CompileContext): ValueEntry {
    ifNotYetVisited(node, context, () => {
        if (node.source.type !== "external") {
            throw new Error("Invalid data source type");
        }
        context.resources.push({
            type: "data",
            key: node.id,
            resource: null,
        });
        context.commands.push({type: "LOAD_EXTERNAL_DATA", ref: node.id, func: node.source.fetch, checkChanged: node.source.checkChanged});
    });
    return {type: "ref", ref: node.id};
}

/**
 * @return the "ref" to the resource holding the actual value
 */
function resolveDataNodeTransform(node: DataRenderGraphNode<unknown>, context: CompileContext): ValueEntry {
    if (node.source.type !== "transform") {
        throw new Error("Invalid data source type");
    }
    const transformerNode = node.source.transformer;
    return resolveTransformer(transformerNode, context);
}

/**
 * @return the "ref" to the resource holding the actual value
 */
function resolveDataNodeTransformMultiOut(node: DataRenderGraphNode<unknown>, context: CompileContext): ValueEntry {
    if (node.source.type !== "transform-multi-out") {
        throw new Error("Invalid data source type");
    }
    const transformerNode = node.source.transformer;
    const transformerResult = resolveTransformerMultiOut(transformerNode, context);
    return transformerResult.type === "const"
        ? transformerResult
        : {type: "ref", ref: transformerResult.ref + "#" + node.source.key};
}

function resolveCanvasSize(_node: CanvasSizeRenderGraphNode, _context: CompileContext): ValueEntry<[number, number]> {
    return {type: "ref", ref: "rg-internal:canvas-size"};
}

/**
 * @return the "ref" to the resource holding the actual value
 */
function resolveTransformer(node: TransformRenderGraphNode<unknown[], unknown>, context: CompileContext): ValueEntry {
    ifNotYetVisited(node, context, () => {
        context.resources.push({
            type: "data",
            key: node.id,
            resource: null,
        });
        const args = node.inputs.map(inputNode => resolveDataNode(inputNode, context));
        context.commands.push({type: "TRANSFORM_DATA", args: args, refOut: node.id, func: node.func});
    });
    return {type: "ref", ref: node.id};
}

/**
 * @return the "ref" to the resource holding the actual value. ref must be appended with "#<key>" to select the specific output
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveTransformerMultiOut(node: TransformMultiOutRenderGraphNode<unknown[], any>, context: CompileContext): ValueEntry {
    ifNotYetVisited(node, context, () => {
        node.outputs.forEach(outputKey => {
            context.resources.push({
                type: "data",
                key: node.id + "#" + (outputKey.toString()),
                resource: null,
            });
        });
        const args = node.inputs.map(inputNode => resolveDataNode(inputNode, context));
        context.commands.push({type: "TRANSFORM_DATA_MULTI_OUT", args: args, refOut: node.id, func: node.func});
    });
    return {type: "ref", ref: node.id};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveTransformerVertexOut(node: TransformVertexOutRenderGraphNode<unknown[], any>, context: CompileContext): ValueEntry {
    ifNotYetVisited(node, context, () => {
        Object.keys(node.outputs).forEach(outputKey => {
            context.resources.push({
                type: "vertexbuffer",
                key: node.id + "#" + outputKey,
                resource: null,
            });
        })
        const args = node.inputs.map(inputNode => resolveDataNode(inputNode, context));
        context.commands.push({type: "TRANSFORM_DATA_VERTEX_OUT", args: args, refOut: node.id, func: node.func});
    });
    return {type: "ref", ref: node.id};
}


function bindVAO(node: GeometryRenderGraphNode, nodeProgram: ShaderRenderGraphNode, context: CompileContext) {
    ifNotYetVisited(node, context, () => {

        const attributes: WebGlVertexArrayAttributeResource[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.sources as GeometrySource<any>[]).forEach(source => {
            const bufferContent = source.source.outputs[source.output].content;
            const bufferLayout = source.source.outputs[source.output].layout;
            bufferLayout.forEach(entry => {
                attributes.push({
                    bufferResourceKey: source.source.id + "#" + source.output,
                    name: (context.activeShader?.prefixVertexAttributes ?? "") + entry.name,
                    type: entry.type,
                    amountComponents: entry.amountComponents,
                    normalized: entry.normalized,
                    divisor: bufferContent === "vertices" ? 0 : 1,
                });
            });
        });

        context.resources.push({
            type: "vertexarray",
            key: node.id,
            attributes: attributes,
            programResourceKey: nodeProgram.id,
            resource: null,
        })

        node.sources.forEach(source => {
            resolveTransformerVertexOut(source.source, context);
        });
    })
    context.commands.push({type: "BIND_VAO", id: node.id});
}


/**
 * @return the ref to the camera data (append with #proj, #view, #projview)
 */
function updateAndResolveCamera(node: CameraRenderGraphNode, context: CompileContext): string {
    ifNotYetVisited(node, context, () => {
        context.resources.push({
            type: "data",
            key: node.id + "#proj",
            resource: null,
        })
        context.resources.push({
            type: "data",
            key: node.id + "#view",
            resource: null,
        })
        context.resources.push({
            type: "data",
            key: node.id + "#viewproj",
            resource: null,
        })
        if (node.data.type === "perspective") {
            const up = resolveDataNode(node.data.up, context) as ValueEntry<vec3>;
            const position = resolveDataNode(node.data.position, context) as ValueEntry<vec3>;
            const direction = resolveDataNode(node.data.direction, context) as ValueEntry<vec3>;
            const fov = resolveDataNode(node.data.fov, context) as ValueEntry<number>;
            const near = resolveDataNode(node.data.near, context) as ValueEntry<number>;
            const far = resolveDataNode(node.data.far, context) as ValueEntry<number>;
            const size = node.renderTargetSize.type === "canvas-size"
                ? resolveCanvasSize(node.renderTargetSize, context)
                : resolveDataNode(node.renderTargetSize, context) as ValueEntry<[number, number]>;
            context.commands.push({
                type: "CALCULATE_PERSPECTIVE_PROJECTION",
                ref: node.id + "#proj",
                size: size,
                fov: fov,
                near: near,
                far: far,
            });
            context.commands.push({type: "CALCULATE_3D_VIEW", ref: node.id + "#view", up: up, position: position, direction: direction});
            context.commands.push({
                type: "CALCULATE_VIEW_PROJECTION",
                ref: node.id + "#viewproj",
                refProjection: node.id + "#proj",
                refView: node.id + "#view",
            });
        }
        if (node.data.type === "orthographic") {
            const up = resolveDataNode(node.data.up, context) as ValueEntry<vec3>;
            const position = resolveDataNode(node.data.position, context) as ValueEntry<vec3>;
            const direction = resolveDataNode(node.data.direction, context) as ValueEntry<vec3>;
            const near = resolveDataNode(node.data.near, context) as ValueEntry<number>;
            const far = resolveDataNode(node.data.far, context) as ValueEntry<number>;
            const size = node.renderTargetSize.type === "canvas-size"
                ? resolveCanvasSize(node.renderTargetSize, context)
                : resolveDataNode(node.renderTargetSize, context) as ValueEntry<[number, number]>;
            context.commands.push({type: "CALCULATE_ORTHOGRAPHIC_PROJECTION", ref: node.id + "#proj", size: size, near: near, far: far});
            context.commands.push({type: "CALCULATE_3D_VIEW", ref: node.id + "#view", up: up, position: position, direction: direction});
            context.commands.push({
                type: "CALCULATE_VIEW_PROJECTION",
                ref: node.id + "#viewproj",
                refProjection: node.id + "#proj",
                refView: node.id + "#view",
            });
        }
    })
    return node.id;
}

function findTextureUnit(textureId: string, reservedTextures: string[], context: CompileContext): { unit: number, alreadyBound: boolean } {

    // 1) find if already bound
    for (let i = 0; i < context.textureUnits.length; i++) {
        if (context.textureUnits[i] === textureId) {
            context.textureUnits[i] = textureId;
            return {unit: i, alreadyBound: true};
        }
    }

    // 2) find empty unit
    for (let i = 0; i < context.textureUnits.length; i++) {
        if (context.textureUnits[i] === null || context.textureUnits[i] === undefined) {
            context.textureUnits[i] = textureId;
            return {unit: i, alreadyBound: false};
        }
    }

    // 3) find unit to overwrite
    for (let i = 0; i < context.textureUnits.length; i++) {
        const unitContent = context.textureUnits[i];
        if (unitContent !== null && reservedTextures.includes(unitContent)) {
            context.textureUnits[i] = textureId;
            return {unit: i, alreadyBound: false};
        }
    }

    throw new Error("Could not reserve texture unit for " + textureId);
}

interface DrawCallInfo {
    shader: ShaderRenderGraphNode,
    geometry: GeometryRenderGraphNode,
    renderTarget: RendertargetRenderGraphNode | CanvasRenderGraphNode,
    uniforms: {
        textures: ({ name: string, node: TextureRenderGraphNode })[],
        selectTextures: ({ name: string, node: SelectTextureRenderGraphNode<unknown[], string> })[],
        renderTargetTextures: ({ name: string, node: RendertargetRenderGraphNode })[],
        generic: ({ name: string, node: DataRenderGraphNode<unknown> | CameraRenderGraphNode | CanvasSizeRenderGraphNode })[]
    }
}

function collectDrawCallInfo(drawNode: DrawRenderGraphNode, nodes: RenderGraphNode[]): DrawCallInfo {

    // get shader
    const nodeShader = drawNode.shader;

    // get geometry
    const nodeGeometry = drawNode.geometry;

    // get render target
    const nodesRenderTarget: (RendertargetRenderGraphNode | CanvasRenderGraphNode)[] = [];
    nodes.forEach(node => {
        if (node.type === "canvas" && node.renderPasses.includes(drawNode)) {
            nodesRenderTarget.push(node);
        }
        if (node.type === "rendertarget" && node.renderPasses.includes(drawNode)) {
            nodesRenderTarget.push(node);
        }
    });
    if (nodesRenderTarget.length !== 1) {
        throw new Error("Draw node is used for an invalid amount of render targets: " + nodesRenderTarget.length + " (expected 1).");
    }
    const nodeRenderTarget = nodesRenderTarget[0];

    // get uniforms
    const nodesTextures: ({ name: string, node: TextureRenderGraphNode })[] = [];
    const nodesSelectTextures: ({ name: string, node: SelectTextureRenderGraphNode<unknown[], string> })[] = [];
    const nodesRenderTargetTextures: ({ name: string, node: RendertargetRenderGraphNode })[] = [];
    const nodesGeneric: ({ name: string, node: DataRenderGraphNode<unknown> | CameraRenderGraphNode | CanvasSizeRenderGraphNode })[] = [];
    Object.entries(drawNode.inputs).forEach(([name, node]) => {
        if (node.type === "texture") {
            nodesTextures.push({name: name, node: node});
        }
        if (node.type === "select-texture") {
            nodesSelectTextures.push({name: name, node: node});
        }
        if (node.type === "rendertarget") {
            nodesRenderTargetTextures.push({name: name, node: node});
        }
        if (node.type === "camera" || node.type === "data" || node.type === "canvas-size") {
            nodesGeneric.push({name: name, node: node});
        }
    });

    return {
        shader: nodeShader,
        geometry: nodeGeometry,
        renderTarget: nodeRenderTarget,
        uniforms: {
            textures: nodesTextures,
            selectTextures: nodesSelectTextures,
            renderTargetTextures: nodesRenderTargetTextures,
            generic: nodesGeneric,
        },
    };
}


function ifNotYetVisited(node: RenderGraphNode, context: CompileContext, action: () => void) {
    if (!context.relevantVisitedNodeIds.has(node.id)) {
        context.relevantVisitedNodeIds.add(node.id);
        action();
    }
}