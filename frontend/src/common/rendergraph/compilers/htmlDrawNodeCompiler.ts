import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderHtmlElementsRenderGraphCommand} from "../commands/renderHtmlElementsRenderGraphCommand";
import {ContainerRenderGraphNode} from "../nodes/containerRenderGraphNode";
import {RenderElementGeneratorRenderGraphNode} from "../nodes/renderElementGeneratorRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class HtmlDrawNodeCompiler implements RenderGraphNodeCompiler<ContainerRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof ContainerRenderGraphNode;
	}

	compile(node: ContainerRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new RenderHtmlElementsRenderGraphCommand(
				RenderGraphKeys.cachedHtmlElement(node),
				RenderGraphKeys.property(node.getCameraProperty()),
				this.buildExecCondition(node),
				this.collectSources(node),
			),
		];
	}

	private buildExecCondition(node: ContainerRenderGraphNode): (resourceManager: RenderGraphResourceManager) => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(
			node
				.getDrawNodes()
				.flatMap(it => it.getInputs())
				.filter(it => it instanceof RenderElementGeneratorRenderGraphNode)
				.distinct()
				.map(it => it as RenderElementGeneratorRenderGraphNode)
				.map(it => it.getChangeTest())
		);
	}

	private collectSources(node: ContainerRenderGraphNode): RenderHtmlElementsRenderGraphCommand.Source[] {
		return node.getDrawNodes().map(it => {
			return {
				elementDataKey: RenderGraphKeys.genericData(it.getSource()),
				elementPoolKey: RenderGraphKeys.pooledHtmlElements(it.getSource()),
				cullingRadius: it.getCullingRadius(),
				templateFunc: it.getTemplateFunc(),
				renderFunc: it.getRenderFunc(),
			};
		});
	}

}