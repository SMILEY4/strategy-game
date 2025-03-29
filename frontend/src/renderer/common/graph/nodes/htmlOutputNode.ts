import {RenderNode} from "../RenderNode";
import {NodeOutput} from "./nodeOutput";
import {NodeInput} from "./nodeInput";

export class HtmlOutputNode extends RenderNode {

	public readonly config: HtmlOutputConfig;

	protected constructor(config: HtmlOutputConfig) {
		super(config.id);
		this.config = config;
	}

}


export interface HtmlOutputConfig {
	id: string,
	changeKey: string | null,
	input: (NodeInput.HtmlData)[],
	output: (NodeOutput.HtmlContainer)[]
}