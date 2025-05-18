import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdatePropertyCommand} from "../commands/updatePropertyCommand";
import {RenderGraphKeys} from "../renderGraphKeys";
import {
	AbstractPropertyRenderGraphNode,
	ConstPropertyRenderGraphNode,
	DerivedPropertyRenderGraphNode,
	DynamicPropertyRenderGraphNode,
	GeneratedPropertyRenderGraphNode,
} from "../nodes/propertyRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

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
				this.buildExecCondition(node),
			),
		];
	}

	private buildExecCondition(node: AbstractPropertyRenderGraphNode<any, any>): (resourceManager: RenderGraphResourceManager) => boolean {

		if (node instanceof ConstPropertyRenderGraphNode) {
			return () => false;
		}

		if (node instanceof DynamicPropertyRenderGraphNode) {
			return (resourceManager: RenderGraphResourceManager) => {
				for (let changeTest of node.getChangeTests()) {
					if (changeTest(resourceManager)) {
						return true;
					}
				}
				return false;
			};
		}

		if (node instanceof DerivedPropertyRenderGraphNode) {
			return this.buildExecCondition(node.getSource());
		}

		if (node instanceof GeneratedPropertyRenderGraphNode) {
			const resourceName = RenderGraphKeys.genericData(node.getSource());
			return (resourceManager: RenderGraphResourceManager) => {
				const currentFrameId = resourceManager.getCurrentFrameId();
				const lastUpdatedFrameId = resourceManager.getResourceLastUpdateFrameId(resourceName);
				return currentFrameId === lastUpdatedFrameId;
			};
		}

		throw new Error("Unhandled abstract property node type: " + node.getName());

	}

}