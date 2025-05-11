import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderHtmlElementsRenderGraphCommand} from "../commands/renderHtmlElementsRenderGraphCommand";
import {ContainerRenderGraphNode} from "../nodes/containerRenderGraphNode";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";

export class HtmlDrawNodeCompiler implements RenderGraphNodeCompiler<ContainerRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ContainerRenderGraphNode;
	}

	compile(node: ContainerRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new RenderHtmlElementsRenderGraphCommand(
				this.buildExecCondition(node),
				RenderGraphKeys.cachedHtmlElement(node),
				this.collectSources(node),
				RenderGraphKeys.property(node.getCameraProperty()),
			),
		];
	}

	private buildExecCondition(node: ContainerRenderGraphNode): () => boolean {

		const creatorNodes = node
			.getRenderNodes()
			.flatMap(it => it.getInputs())
			.filter(it => it instanceof ElementCreatorRenderGraphNode)
			.distinct();

		const changeTests: (() => boolean)[] = [];
		creatorNodes.forEach(creator => {
			changeTests.push(
				...creator
					.getInputs()
					.filter(it => it instanceof PropertyRenderGraphNode)
					.map(it => it as PropertyRenderGraphNode<any>)
					.flatMap(it => it.getChangeTests()),
			);
		});

		return () => {
			for (let changeTest of changeTests) {
				if (changeTest()) {
					return true;
				}
			}
			return false;
		};
	}

	private collectSources(node: ContainerRenderGraphNode): RenderHtmlElementsRenderGraphCommand.Source[] {
		return node.getRenderNodes().map(it => {
			return {
				elementDataKey: RenderGraphKeys.elementsData(it.getSource()),
				elementPoolKey: RenderGraphKeys.pooledHtmlElements(it.getSource()),
				cullingRadius: it.getCullingRadius(),
				templateFunc: it.getTemplateFunc(),
				renderFunc: it.getRenderFunc(),
			};
		});
	}

}