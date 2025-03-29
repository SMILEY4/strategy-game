import {BaseRenderGraphSorter} from "../graph/baseRenderGraphSorter";
import {AbstractRenderNode} from "../graph/nodes/abstractRenderNode";
import {HtmlNode} from "../graph/nodes/htmlNode";
import {HtmlOutputNode} from "../graph/nodes/htmlOutputNode";
import {NodeInput} from "../graph/nodes/nodeInput";
import {NodeOutput} from "../graph/nodes/nodeOutput";

export class HtmlRenderGraphSorter extends BaseRenderGraphSorter {

	getDependableInputResources(node: RenderNode): string[] {
		const resources: string[] = [];

		if (node instanceof HtmlOutputNode) {
			resources.push(
				...node.config.input
					.filter(e => e instanceof NodeInput.HtmlData)
					.map(e => "htmldata:" + (e as NodeInput.HtmlData).name),
			);
		}

		return resources;
	}

	getDependableOutputResources(node: RenderNode): string[] {
		const resources: string[] = [];

		if (node instanceof HtmlNode) {
			resources.push(
				...node.config.output
					.filter(e => e instanceof NodeOutput.HtmlData)
					.map(e => "htmldata:" + (e as NodeOutput.HtmlData<any>).name),
			);
		}

		return resources;
	}

	getSharedInputResources(node: RenderNode): string[] {
		return [];
	}

}