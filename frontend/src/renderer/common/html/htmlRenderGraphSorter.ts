import {BaseRenderGraphSorter} from "../graph/baseRenderGraphSorter";
import {AbstractRenderNode} from "../graph/nodes/abstractRenderNode";
import {HtmlDataNode} from "../graph/nodes/htmlDataNode";
import {HtmlDrawNode} from "../graph/nodes/htmlDrawNode";
import {NodeInput} from "../graph/nodes/nodeInput";
import {NodeOutput} from "../graph/nodes/nodeOutput";

export class HtmlRenderGraphSorter extends BaseRenderGraphSorter {

	getDependableInputResources(node: AbstractRenderNode): string[] {
		const resources: string[] = [];

		if (node instanceof HtmlDrawNode) {
			resources.push(
				...node.config.input
					.filter(e => e instanceof NodeInput.HtmlData)
					.map(e => "htmldata:" + (e as NodeInput.HtmlData).name),
			);
		}

		return resources;
	}

	getDependableOutputResources(node: AbstractRenderNode): string[] {
		const resources: string[] = [];

		if (node instanceof HtmlDataNode) {
			resources.push(
				...node.config.output
					.filter(e => e instanceof NodeOutput.HtmlData)
					.map(e => "htmldata:" + (e as NodeOutput.HtmlData<any>).name),
			);
		}

		return resources;
	}

	getSharedInputResources(node: AbstractRenderNode): string[] {
		return [];
	}

}