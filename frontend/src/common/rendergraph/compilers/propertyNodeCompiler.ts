import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdatePropertyCommand} from "../commands/updatePropertyCommand";
import {RenderGraphKeys} from "../renderGraphKeys";
import {AbstractPropertyRenderGraphNode, ConstPropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";

export class PropertyNodeCompiler implements RenderGraphNodeCompiler<AbstractPropertyRenderGraphNode<any, any>> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof AbstractPropertyRenderGraphNode;
	}

	compile(node: AbstractPropertyRenderGraphNode<any, any>, context: RenderGraphCompileContext): RenderGraphCommand[] {

		if (node instanceof ConstPropertyRenderGraphNode) {
			return [];
		}

		return [
			new UpdatePropertyCommand(
				RenderGraphKeys.property(node),
				node.getValueProvider(context.getResourceManager()),
				node.getChangeTest(),
			),
		];
	}

}