import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateVertexDataRenderGraphCommand} from "../commands/updateVertexDataRenderGraphCommand";
import {RenderGraphChangeTracker} from "../renderGraphChangeTracker";
import {RenderGraphKeys} from "../renderGraphKeys";

export class VertexCreatorNodeCompiler implements RenderGraphNodeCompiler<VertexCreatorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof VertexCreatorRenderGraphNode;
	}

	compile(node: VertexCreatorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {

		const changeTracker = context.getCompileResource<RenderGraphChangeTracker>(RenderGraphKeys.changeTracker());
		const changeTests = [
			...node
				.getProperties()
				.flatMap(it => it.getChangeTests()),
			...node
				.getProperties()
				.flatMap(it => it.getTrackedChangeKeys())
				.map(trackedChangeKey => {
					return () => changeTracker.hasChange(trackedChangeKey);
				}),
		];
		const execCondition: () => boolean = () => {
			for (let changeTest of changeTests) {
				if (changeTest()) {
					return true;
				}
			}
			return false;
		};

		const execContextEntries = new Map<string, () => any>();
		for (let property of node.getProperties()) {
			execContextEntries.set(property.getName(), property.getProvider());
		}
		const execContext = new VertexCreatorRenderGraphNode.Context(execContextEntries);

		return [
			new UpdateVertexDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				execCondition,
				execContext,
			),
		];
	}

}