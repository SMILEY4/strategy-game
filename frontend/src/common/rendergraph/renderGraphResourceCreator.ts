import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphResourceManager} from "./renderGraphResourceManager";

export interface RenderGraphResourceCreator<TNode extends RenderGraphNode> {
	appliesTo(node: RenderGraphNode): boolean;
	create(node: TNode, manager: RenderGraphResourceManager): void
}