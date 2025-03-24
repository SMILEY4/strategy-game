import {AbstractRenderNode} from "./abstractRenderNode";
import {NodeOutput} from "./nodeOutput";

/**
 * Node in render graph that renders/creates html elements
 */
export abstract class HtmlNode<TContext> extends AbstractRenderNode {

    public readonly config: HtmlNodeConfig<TContext>;


    protected constructor(config: HtmlNodeConfig<TContext>) {
        super(config.id);
        this.config = config;
    }

    public abstract execute(context: TContext): HtmlDataResource;

}

/**
 * The configuration of the html node
 */
export interface HtmlNodeConfig<TContext> {
    id: string,
    changeKey: string | null,
    input: never[],
    output: (NodeOutput.HtmlContainer | NodeOutput.HtmlData<TContext>)[]
}

/**
 * The result of the execute-function
 */
export class HtmlDataResource {
    public readonly elements: Map<string, any>;

    constructor(props: { outputs: Map<string, any[]> }) {
        this.elements = props.outputs;
    }
}

export const EMPTY_HTML_DATA_RESOURCE = new HtmlDataResource({
    outputs: new Map<string, []>
})