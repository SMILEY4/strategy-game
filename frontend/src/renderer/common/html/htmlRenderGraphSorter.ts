import {BaseRenderGraphSorter} from "../graph/baseRenderGraphSorter";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {HtmlNode} from "../graph/htmlNode";
import {HtmlOutputNode} from "../graph/htmlOutputNode";
import {NodeInput} from "../graph/nodeInput";
import {NodeOutput} from "../graph/nodeOutput";

export class HtmlRenderGraphSorter extends BaseRenderGraphSorter {

	getDependableInputResources(node: AbstractRenderNode): string[] {
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

	getDependableOutputResources(node: AbstractRenderNode): string[] {
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

	getSharedInputResources(node: AbstractRenderNode): string[] {
		return [];
	}

}