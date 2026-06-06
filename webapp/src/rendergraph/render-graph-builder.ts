import type {CanvasRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas.ts";
import type {DrawRenderGraphNode, DrawRenderGraphNodeInput} from "@rendergraph/nodes/rg-node.draw.ts";
import type {RendertargetRenderGraphNode} from "@rendergraph/nodes/rg-node.rendertarget.ts";
import type {ShaderRenderGraphNode} from "@rendergraph/nodes/rg-node.shader.ts";
import type {TextureRenderGraphNode} from "@rendergraph/nodes/rg-node.texture.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {TransformRenderGraphNode} from "@rendergraph/nodes/rg-node.transform.ts";
import type {TransformMultiOutRenderGraphNode} from "@rendergraph/nodes/rg-node.transform-multi-out.ts";
import type {
    TransformVertexOutRenderGraphNode,
    VertexDataOutput,
    VertexDataResult,
} from "@rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {GeometryRenderGraphNode, GeometrySource} from "@rendergraph/nodes/rg-node.geometry.ts";
import type {SelectTextureRenderGraphNode} from "@rendergraph/nodes/rg-node.select-texture.ts";
import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import type {CameraRenderGraphNode} from "@rendergraph/nodes/rg-node.camera.ts";
import type {CanvasSizeRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas-size.ts";

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

    public data<TData>(options: {
        source:
            | { type: "constant", value: TData }
            | { type: "external", fetch: () => TData, checkChanged: (prev: TData) => boolean }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            | { type: "transform", transformer: TransformRenderGraphNode<any, TData> }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            | { type: "transform-multi-out", key: string, transformer: TransformMultiOutRenderGraphNode<any, Record<string, any | null>> }
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

    public dataExternal<TData>(fetch: () => TData, checkChanged?: (prev: TData) => boolean): DataRenderGraphNode<TData> {
        return this.data<TData>({
            source: {
                type: "external",
                fetch: fetch,
                checkChanged: checkChanged ?? (() => true),
            },
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    }): DrawRenderGraphNode {
        const node: DrawRenderGraphNode = {
            type: "draw",
            id: RenderGraphBuilder.generateNodeId(),
            shader: options.shader,
            geometry: options.geometry,
            inputs: options.inputs ?? {},
        };
        this.nodes.push(node);
        return node;
    }

    public geometry(options: {
        sources: GeometrySource<string>[];
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public geometrySource<T extends TransformVertexOutRenderGraphNode<any[], any>>(options: {
        source: T,
        output: keyof T["outputs"],
    }): GeometrySource<string> {
        return {
            source: options.source,
            output: options.output as string,
        };
    }

    public rendertarget(options: {
        size: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode
        renderPasses: DrawRenderGraphNode[],
        colorBuffer?: boolean,
        depthBuffer?: boolean,
        depthTesting?: boolean,
        clearColor?: [number, number, number, number]
    }): RendertargetRenderGraphNode {
        const node: RendertargetRenderGraphNode = {
            type: "rendertarget",
            id: RenderGraphBuilder.generateNodeId(),
            size: options.size,
            renderPasses: options.renderPasses,
            colorBuffer: options.colorBuffer ?? true,
            depthBuffer: options.depthBuffer ?? false,
            depthTesting: options.depthTesting ?? false,
            clearColor: options.clearColor ?? null,
        };
        this.nodes.push(node);
        return node;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        fov: DataRenderGraphNode<number>;
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

    public getNodes(): RenderGraphNode[] {
        return this.nodes;
    }

    private static generateNodeId(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    }

}
