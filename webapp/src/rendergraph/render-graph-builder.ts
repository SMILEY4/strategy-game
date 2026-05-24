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

export class RenderGraphBuilder {

    private readonly nodes: RenderGraphNode[] = [];

    public canvas(options: {
        name?: string,
        renderPasses: DrawRenderGraphNode[],
    }): CanvasRenderGraphNode {
        const node: CanvasRenderGraphNode = {
            type: "canvas",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            renderPasses: options.renderPasses,
        };
        this.nodes.push(node);
        return node;
    }

    public data<TData>(options: {
        name?: string
        source:
            | { type: "constant", value: TData }
            | { type: "external", fetch: () => TData }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            | { type: "transform", transformer: TransformRenderGraphNode<any, TData> }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            | { type: "transform-multi-out", key: string, transformer: TransformMultiOutRenderGraphNode<any, Record<string, any | null>> }
    }): DataRenderGraphNode<TData> {
        const node: DataRenderGraphNode<TData> = {
            type: "data",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            source: options.source,
        };
        this.nodes.push(node);
        return node;
    }

    public draw(options: {
        name?: string,
        shader: ShaderRenderGraphNode,
        geometry: GeometryRenderGraphNode
        inputs?: Record<string, DrawRenderGraphNodeInput>
    }): DrawRenderGraphNode {
        const node: DrawRenderGraphNode = {
            type: "draw",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            shader: options.shader,
            geometry: options.geometry,
            inputs: options.inputs ?? {},
        };
        this.nodes.push(node);
        return node;
    }

    public geometry(options: {
        name?: string,
        sources: GeometrySource<string>[];
    }): GeometryRenderGraphNode {
        const node: GeometryRenderGraphNode = {
            type: "geometry",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
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
        name?: string,
        renderPasses: DrawRenderGraphNode[],
    }): RendertargetRenderGraphNode {
        const node: RendertargetRenderGraphNode = {
            type: "rendertarget",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            renderPasses: options.renderPasses,
        };
        this.nodes.push(node);
        return node;
    }

    public selectTexture<TIn, TKeys extends string>(options: {
        name?: string,
        input: DataRenderGraphNode<TIn>
        options: Record<TKeys, TextureRenderGraphNode>,
        selector: (args: TIn) => TKeys
    }): SelectTextureRenderGraphNode<TIn, TKeys> {
        const node: SelectTextureRenderGraphNode<TIn, TKeys> = {
            type: "select-texture",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            input: options.input,
            options: options.options,
            selector: options.selector,
        };
        this.nodes.push(node);
        return node;
    }

    public shader(options: {
        name?: string,
        srcVertex: string,
        srcFragment: string
    }): ShaderRenderGraphNode {
        const node: ShaderRenderGraphNode = {
            type: "shader",
            srcVertex: options.srcVertex,
            srcFragment: options.srcFragment,
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
        };
        this.nodes.push(node);
        return node;
    }


    public texture(options: {
        name?: string,
        url: string,
        wrap?: "repeat" | "clamp-to-edge" | "mirrored-repeat",
        filterMin?: "linear" | "nearest" | "nearest-mipmap-nearest" | "linear-mipmap-nearest" | "nearest-mipmap-linear" | "linear-mipmap-linear",
        filterMag?: "linear" | "nearest"
    }): TextureRenderGraphNode {
        const node: TextureRenderGraphNode = {
            type: "texture",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
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
        name?: string,
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        func: (...args: TIn) => TOut | null
    }): TransformRenderGraphNode<TIn, TOut> {
        const node: TransformRenderGraphNode<TIn, TOut> = {
            type: "transform",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            inputs: options.inputs,
            func: options.func,
        };
        this.nodes.push(node);
        return node;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transformMultiOut<TIn extends any[], TOut extends Record<string, any | null>>(options: {
        name?: string,
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        func: (...args: TIn) => TOut
    }): TransformMultiOutRenderGraphNode<TIn, TOut> {
        const node: TransformMultiOutRenderGraphNode<TIn, TOut> = {
            type: "transform-multi-out",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            inputs: options.inputs,
            func: options.func,
        };
        this.nodes.push(node);
        return node;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public transformVertexOut<TIn extends any[], TKeys extends string>(options: {
        name?: string,
        inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
        outputs: Record<TKeys, VertexDataOutput>
        func: (...args: TIn) => Record<TKeys, VertexDataResult | null>
    }): TransformVertexOutRenderGraphNode<TIn, TKeys> {
        const node: TransformVertexOutRenderGraphNode<TIn, TKeys> = {
            type: "transform-vertex-out",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            inputs: options.inputs,
            outputs: options.outputs,
            func: options.func,
        };
        this.nodes.push(node);
        return node;
    }

    public cameraPerspective(options: {
        name?: string,
        up: DataRenderGraphNode<[number, number, number]>;
        position: DataRenderGraphNode<[number, number, number]>;
        direction: DataRenderGraphNode<[number, number, number]>;
        fov: DataRenderGraphNode<number>;
        near: DataRenderGraphNode<number>;
        far: DataRenderGraphNode<number>;
    }): CameraRenderGraphNode {
        const node: CameraRenderGraphNode = {
            type: "camera",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
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
        name?: string,
        up: DataRenderGraphNode<[number, number, number]>;
        position: DataRenderGraphNode<[number, number, number]>;
        direction: DataRenderGraphNode<[number, number, number]>;
        fov: DataRenderGraphNode<number>;
        near: DataRenderGraphNode<number>;
        far: DataRenderGraphNode<number>;
    }): CameraRenderGraphNode {
        const node: CameraRenderGraphNode = {
            type: "camera",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
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

    public camera2d(options: {
        name?: string,
        position: DataRenderGraphNode<[number, number]>;
        zoom: DataRenderGraphNode<number>;
    }): CameraRenderGraphNode {
        const node: CameraRenderGraphNode = {
            type: "camera",
            name: options.name ?? RenderGraphBuilder.generateNodeName(),
            data: {
                type: "2d",
                position: options.position,
                zoom: options.zoom,
            },
        };
        this.nodes.push(node);
        return node;
    }

    public getNodes(): RenderGraphNode[] {
        return this.nodes;
    }

    private static generateNodeName(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    }

}


