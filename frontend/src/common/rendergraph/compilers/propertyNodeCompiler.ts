import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {UpdatePropertyCommand} from "../commands/updatePropertyCommand";
import {RenderGraphKeys} from "../renderGraphKeys";

export class PropertyNodeCompiler implements RenderGraphNodeCompiler<PropertyRenderGraphNode<any>> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof PropertyRenderGraphNode;
	}

	compile(node: PropertyRenderGraphNode<any>, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new UpdatePropertyCommand(RenderGraphKeys.property(node), node.getProvider())
		];
	}

}