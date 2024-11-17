import {AbstractRenderNode} from "./abstractRenderNode";
import {NodeOutput} from "./nodeOutput";

/**
 * Node in render graph that renders/creates html elements
 */
export abstract class HtmlRenderNode extends AbstractRenderNode {

    public readonly config: HtmlRenderNodeConfig;


    protected constructor(config: HtmlRenderNodeConfig) {
        super(config.id);
        this.config = config;
    }

    public abstract execute(): HtmlDataResource;

}

/**
 * The configuration of the html node
 */
export interface HtmlRenderNodeConfig {
    id: string,
    input: never[],
    output: (NodeOutput.HtmlContainer | NodeOutput.HtmlData)[]
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