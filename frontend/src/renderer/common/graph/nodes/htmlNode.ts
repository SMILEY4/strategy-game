import {RenderNode} from "../RenderNode";
import {NodeOutput} from "./nodeOutput";
import {TileSummary} from "../../../../models/tile/tileSummary";

export abstract class HtmlNode<TContext> extends RenderNode {

	public readonly config: HtmlDataNodeConfig<TContext>;

	protected constructor(config: HtmlDataNodeConfig<TContext>) {
		super(config.id);
		this.config = config;
	}

	public abstract execute(context: TContext): HtmlDataResource

}


export interface HtmlDataNodeConfig<TContext> {
	id: string,
	changeKey: string | null,
	input: never[],
	output: (NodeOutput.HtmlData<TContext>)[]
}

export class HtmlDataResource {
	public readonly outputs: Map<string, HtmlDataEntry[]>;

	constructor(props: { outputs: Map<string, HtmlDataEntry[]> }) {
		this.outputs = props.outputs;
	}
}

export interface HtmlDataEntry {
	tile: TileSummary;
}