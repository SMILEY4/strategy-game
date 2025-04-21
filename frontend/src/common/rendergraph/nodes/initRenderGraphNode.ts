import {RenderGraphNode} from "../renderGraphNode";

export class InitRenderGraphNode extends RenderGraphNode<InitRenderGraphNode> {

	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}