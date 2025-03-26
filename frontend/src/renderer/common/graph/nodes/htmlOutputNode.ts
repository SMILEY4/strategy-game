import {AbstractRenderNode} from "./abstractRenderNode";
import {NodeOutput} from "./nodeOutput";
import {NodeInput} from "./nodeInput";

export class HtmlOutputNode extends AbstractRenderNode {

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