import {ElementCreatorRenderGraphNode} from "../../../common/rendergraph/nodes/elementCreatorRenderGraphNode";
import {buildMap} from "../../../common/utils";

export namespace LabelsElementCreator {

	export const OUTPUT_ID = "labels.elements";

	export function funcCreate(): ElementCreatorRenderGraphNode.ElementCreationFuncResult {
		return buildMap([
			[
				OUTPUT_ID,
				[], // todo
			],
		]);
	}

	export function funcTemplate(): HTMLElement {
		// todo
		return null as any;
	}

	export function funcRender(obj: any, target: HTMLElement) {
		// todo
	}

}