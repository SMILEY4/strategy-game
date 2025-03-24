import {AbstractRenderNode} from "./abstractRenderNode";
import {NodeOutput} from "./nodeOutput";
import {NodeInput} from "./nodeInput";
import {HtmlDataEntry} from "./htmlDataNode";

export abstract class HtmlDrawNode<TContext, TData extends HtmlDataEntry> extends AbstractRenderNode {

	public readonly config: HtmlDrawNodeConfig<TContext>;

	protected constructor(config: HtmlDrawNodeConfig<TContext>) {
		super(config.id);
		this.config = config;
	}

	public abstract execute(context: TContext, data: TData): Node

}


export interface HtmlDrawNodeConfig<TContext> {
	id: string,
	changeKey: string | null,
	input: (NodeInput.HtmlData)[],
	output: (NodeOutput.HtmlContainer)[]
}