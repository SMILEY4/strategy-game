import {VertexDataResource} from "./vertexDataRenderResource";

export abstract class VertexDataGenerator<TCreate> {
    public abstract create(ctx: TCreate): VertexDataResource
    public abstract update(vertexData: VertexDataResource): void
}