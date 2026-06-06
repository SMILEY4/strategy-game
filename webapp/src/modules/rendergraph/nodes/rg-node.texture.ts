import type {RenderGraphNodeBase} from "@/modules/rendergraph/nodes/rg-node.ts";

export interface TextureRenderGraphNode extends RenderGraphNodeBase<"texture"> {
    readonly url: string,
    readonly wrap: "repeat" | "clamp-to-edge" | "mirrored-repeat",
    readonly filterMin: "linear" | "nearest" | "nearest-mipmap-nearest" | "linear-mipmap-nearest" | "nearest-mipmap-linear" | "linear-mipmap-linear",
    readonly filterMag: "linear" | "nearest"
}