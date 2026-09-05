import type {CanvasRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.canvas.ts";
import type {DrawRenderGraphNode, DrawRenderGraphNodeInput} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import type {RendertargetAttachment, RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import type {ShaderRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.shader.ts";
import type {TextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.texture.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {TransformRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform.ts";
import type {TransformMultiOutRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform-multi-out.ts";
import type {
    TransformVertexOutRenderGraphNode,
    VertexDataLayout,
    VertexDataOutput,
    VertexDataResult,
} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {GeometryRenderGraphNode, GeometrySource, WasmGeometrySource} from "@modules/rendergraph/nodes/rg-node.geometry.ts";
import type {SelectTextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.select-texture.ts";
import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {CanvasSizeRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.canvas-size.ts";
import type {WasmOperationRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-operation.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {PickRenderTargetAttachmentRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.pick-attachment.ts";
import type {HtmlContainerRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.html-container.ts";
import type {HtmlDrawElement, HtmlDrawInstance, HtmlDrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.html-draw.ts";

/** Builder for constructing a render graph by declaring nodes and their connections. */
export class RenderGraphBuilder {

    private readonly nodes: RenderGraphNode[] = [];

    public canvas(options: {
        renderPasses: DrawRenderGraphNode[],
        depthTesting?: boolean,
        clearColor?: [number, number, number, number]
    }): CanvasRenderGraphNode {
        const node: CanvasRenderGraphNode = {
            type: "canvas",
            id: RenderGraphBuilder.generateNodeId(),
            renderPasses: options.renderPasses,
            depthTesting: options.depthTesting ?? false,
            clearColor: options.clearColor ?? null,
        };
        this.nodes.push(node);
        return node;
    }


    public canvasSize(): CanvasSizeRenderGraphNode {
        const node: CanvasSizeRenderGraphNode = {
            type: "canvas-size",
            id: RenderGraphBuilder.generateNodeId(),
        };
        this.nodes.push(node);
        return node;
    }

    public htmlContainer(options: {
        elementId: string,
        renderPasses: HtmlDrawRenderGraphNode[],
    }): HtmlContainerRenderGraphNode {
        const node: HtmlContainerRenderGraphNode = {
            type: "html-container",
            id: RenderGraphBuilder.generateNodeId(),
            elementId: options.elementId,
            renderPasses: options.renderPasses,
        };
        this.nodes.push(node);
        return node;
    }


    public htmlDraw(options: {
        elements: DataRenderGraphNode<HtmlDrawElement[]>;
        instances: DataRenderGraphNode<HtmlDrawInstance[]>;
    }): HtmlDrawRenderGraphNode {
        const node: HtmlDrawRenderGraphNode = {
            type: "html-draw",
            id: RenderGraphBuilder.generateNodeId(),
            elements: options.elements,
            instances: options.instances,
        };
        this.nodes.push(node);
        return node;
    }

    public data<TData>(options: {
        source:
            | { type: "constant", value: TData }
            | { type: "external", fetch: () => TData, checkChanged: (prev: TData) => boolean }
            | { type: "transform", transformer: TransformRenderGraphNode<any, TData> }
            | { type: "transform-multi-out", key: string, transformer: TransformMultiOutRenderGraphNode<any, Record<string, any | null>> }
            | { type: "wasm", value: WasmDataRenderGraphNode, download: () => TData }
    }): DataRenderGraphNode<TData> {
        const node: DataRenderGraphNode<TData> = {
            type: "data",
            id: RenderGraphBuilder.generateNodeId(),
            source: options.source,
        };
        this.nodes.push(node);
        return node;
    }

    public dataConst<TData>(value: TData): DataRenderGraphNode<TData> {
        return this.data<TData>({
            source: {
                type: "constant",
                value: value,
            },
        });
    }

    public dataExternal<TData>(checkChanged: (prev: TData) => boolean, fetch: () => TData): DataRenderGraphNode<TData> {
        return this.data<TData>({
            source: {
                type: "external",
                fetch: fetch,
                checkChanged: checkChanged ?? (() => true),
            },
        });
    }

    public dataTransformer<TData>(transformer: TransformRenderGraphNode<any[], TData>): DataRenderGraphNode<TData> {
        return this.data<TData>({
            source: {
                type: "transform",
                transformer: transformer,
            },
        });
    }

    public draw(options: {
        shader: ShaderRenderGraphNode,
        geometry: GeometryRenderGraphNode
        inputs?: Record<string, DrawRenderGraphNodeInput>
        blend?: (gl: WebGL2RenderingContext) => void
    }): DrawRenderGraphNode {
        const node: DrawRenderGraphNode = {
            type: "draw",
            id: RenderGraphBuilder.generateNodeId(),
            shader: options.shader,
            geometry: options.geometry,
            inputs: options.inputs ?? {},
            blend: options.blend ?? null,
        };
        this.nodes.push(node);
        return node;
    }

    public geometry(options: {
        sources: (GeometrySource<string> | WasmGeometrySource)[];
        primitives?: "triangles" | "lines"
    }): GeometryRenderGraphNode {
        const node: GeometryRenderGraphNode = {
            type: "geometry",
            id: RenderGraphBuilder.generateNodeId(),
            primitiveTypes: options.primitives ?? "triangles",
            sources: options.sources,
        };
        this.nodes.push(node);
        return node;
    }

    public geometrySource<T extends TransformVertexOutRenderGraphNode<any[], any>>(options: {
        source: T,
        output: keyof T["outputs"],
    }): GeometrySource<string> {
        return {
            sourceType: "transformer",
            source: options.source,
            output: options.output as string,
        };
    }

    public wasmGeometrySource(options: {
        source: WasmDataRenderGraphNode;
        download: () => VertexDataResult,
        content: "vertices" | "instances",
        layout: VertexDataLayout[],
    }): WasmGeometrySource {
        return {
            sourceType: "wasm",
            source: options.source,
            download: options.download,
            content: options.content,
            layout: options.layout,
        };
    }

    public rendertarget<TKeys extends string>(options: {
        size: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode
        sizeScale?: DataRenderGraphNode<number>,
        renderPasses: DrawRenderGraphNode[],
        attachments: Record<TKeys, RendertargetAttachment>,
        depthTesting?: boolean,
        clearColor?: [number, number, number, number]
    }): RendertargetRenderGraphNode<TKeys> {
        const node: RendertargetRenderGraphNode<TKeys> = {
            type: "rendertarget",
            id: RenderGraphBuilder.generateNodeId(),
            size: options.size,
            sizeScale: options.sizeScale ?? null,
            renderPasses: options.renderPasses,
            attachments: options.attachments,
            depthTesting: options.depthTesting ?? false,
            clearColor: options.clearColor ?? null,
        };
        this.nodes.push(node);
        return node;
    }

    public pickRendertargetAttachment<TKeys extends string>(options: {
        rendertarget: RendertargetRenderGraphNode<TKeys>,
        attachment: TKeys
    }): PickRenderTargetAttachmentRenderGraphNode<TKeys> {
        const node: PickRenderTargetAttachmentRenderGraphNode<TKeys> = {
            type: "pick-rendertarget-attachment",
            id: RenderGraphBuilder.generateNodeId(),
            rendertarget: options.rendertarget,
            attachment: options.attachment,
        };
        this.nodes.push(node);
        return node;
    }

    public selectTexture<TIn extends any[], TKeys extends string>(options: {
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        options: Record<TKeys, TextureRenderGraphNode>,
        selector: (...args: TIn) => TKeys
    }): SelectTextureRenderGraphNode<TIn, TKeys> {
        const node: SelectTextureRenderGraphNode<TIn, TKeys> = {
            type: "select-texture",
            id: RenderGraphBuilder.generateNodeId(),
            inputs: options.inputs,
            options: options.options,
            selector: options.selector,
        };
        this.nodes.push(node);
        return node;
    }

    public shader(options: {
        srcVertex: string,
        srcFragment: string,
        prefixVertexAttributes?: string,
        prefixUniforms?: string,
    }): ShaderRenderGraphNode {
        const node: ShaderRenderGraphNode = {
            type: "shader",
            id: RenderGraphBuilder.generateNodeId(),
            srcVertex: options.srcVertex,
            srcFragment: options.srcFragment,
            prefixVertexAttributes: options.prefixVertexAttributes ?? null,
            prefixUniforms: options.prefixUniforms ?? null,
        };
        this.nodes.push(node);
        return node;
    }


    public texture(options: {
        url: string,
        wrap?: "repeat" | "clamp-to-edge" | "mirrored-repeat",
        filterMin?: "linear" | "nearest" | "nearest-mipmap-nearest" | "linear-mipmap-nearest" | "nearest-mipmap-linear" | "linear-mipmap-linear",
        filterMag?: "linear" | "nearest"
    }): TextureRenderGraphNode {
        const node: TextureRenderGraphNode = {
            type: "texture",
            id: RenderGraphBuilder.generateNodeId(),
            url: options.url,
            wrap: options.wrap ?? "repeat",
            filterMin: options.filterMin ?? "nearest-mipmap-linear",
            filterMag: options.filterMag ?? "linear",
        };
        this.nodes.push(node);
        return node;
    }

    public transform<TIn extends any[], TOut>(options: {
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        func: (...args: TIn) => TOut | null,
        checkChanged?: (prev: TOut, next: TOut) => boolean
    }): TransformRenderGraphNode<TIn, TOut> {
        const node: TransformRenderGraphNode<TIn, TOut> = {
            type: "transform",
            id: RenderGraphBuilder.generateNodeId(),
            inputs: options.inputs,
            func: options.func,
            checkChanged: options.checkChanged ?? ((prev, next) => prev !== next),
        };
        this.nodes.push(node);
        return node;
    }

    public transformMultiOut<TIn extends any[], TOut extends Record<string, any | null>>(options: {
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        outputs: (keyof TOut)[]
        func: (...args: TIn) => TOut
    }): TransformMultiOutRenderGraphNode<TIn, TOut> {
        const node: TransformMultiOutRenderGraphNode<TIn, TOut> = {
            type: "transform-multi-out",
            id: RenderGraphBuilder.generateNodeId(),
            inputs: options.inputs,
            outputs: options.outputs,
            func: options.func,
        };
        this.nodes.push(node);
        return node;
    }

    public transformVertexOut<TIn extends any[], TKeys extends string>(options: {
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        outputs: Record<TKeys, VertexDataOutput>
        func: (...args: TIn) => Record<TKeys, VertexDataResult | null>
    }): TransformVertexOutRenderGraphNode<TIn, TKeys> {
        const node: TransformVertexOutRenderGraphNode<TIn, TKeys> = {
            type: "transform-vertex-out",
            id: RenderGraphBuilder.generateNodeId(),
            inputs: options.inputs,
            outputs: options.outputs,
            func: options.func,
        };
        this.nodes.push(node);
        return node;
    }

    public cameraPerspective(options: {
        renderTargetSize: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode
        up: DataRenderGraphNode<[number, number, number]>;
        position: DataRenderGraphNode<[number, number, number]>;
        direction: DataRenderGraphNode<[number, number, number]>;
        fov: DataRenderGraphNode<number>;
        near: DataRenderGraphNode<number>;
        far: DataRenderGraphNode<number>;
    }): CameraRenderGraphNode {
        const node: CameraRenderGraphNode = {
            type: "camera",
            id: RenderGraphBuilder.generateNodeId(),
            renderTargetSize: options.renderTargetSize,
            data: {
                type: "perspective",
                up: options.up,
                position: options.position,
                direction: options.direction,
                fov: options.fov,
                near: options.near,
                far: options.far,
            },
        };
        this.nodes.push(node);
        return node;
    }

    public cameraOrthographic(options: {
        renderTargetSize: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode
        up: DataRenderGraphNode<[number, number, number]>;
        position: DataRenderGraphNode<[number, number, number]>;
        direction: DataRenderGraphNode<[number, number, number]>;
        near: DataRenderGraphNode<number>;
        far: DataRenderGraphNode<number>;
    }): CameraRenderGraphNode {
        const node: CameraRenderGraphNode = {
            type: "camera",
            id: RenderGraphBuilder.generateNodeId(),
            renderTargetSize: options.renderTargetSize,
            data: {
                type: "orthographic",
                up: options.up,
                position: options.position,
                direction: options.direction,
                near: options.near,
                far: options.far,
            },
        };
        this.nodes.push(node);
        return node;
    }

    public wasmData(options: {
        source:
            | { type: "wasm", key?: string, operation: WasmOperationRenderGraphNode<any, any> }
            | { type: "js", data: DataRenderGraphNode<any>, upload: (args: any) => void }; // todo: any args
    }) {
        const node: WasmDataRenderGraphNode = {
            type: "wasm-data",
            id: RenderGraphBuilder.generateNodeId(),
            source: options.source,
        };
        this.nodes.push(node);
        return node;
    }

    public wasmOperation<TIn extends any[], TOut extends Record<string, boolean>>(options: {
        wasmInputs: WasmDataRenderGraphNode[],
        dataInputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        outputs: (keyof TOut)[]
        func: (...args: TIn) => TOut;
    }) {
        const node: WasmOperationRenderGraphNode<TIn, TOut> = {
            type: "wasm-operation",
            id: RenderGraphBuilder.generateNodeId(),
            wasmInputs: options.wasmInputs,
            dataInputs: options.dataInputs,
            outputs: options.outputs,
            func: options.func,
        };
        this.nodes.push(node);
        return node;
    }

    public getNodes(): RenderGraphNode[] {
        return this.nodes;
    }

    private static generateNodeId(): string {
        return crypto.randomUUID();
    }

}
