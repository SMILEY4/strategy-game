import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphResourceManager} from "./renderGraphResourceManager";

export interface RenderGraphResourceCreator<T extends RenderGraphNode<any>> {
	appliesTo(node: RenderGraphNode<any>): boolean;
	create(node: RenderGraphNode<T>, manager: RenderGraphResourceManager): void
}