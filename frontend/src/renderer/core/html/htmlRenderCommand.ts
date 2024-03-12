import {RenderCommand} from "../graph/renderCommand";
import {HtmlResourceManager} from "./htmlResourceManager";
import {NodeOutput} from "../graph/nodeOutput";
import HtmlData = NodeOutput.HtmlData;
import { HtmlRenderNode} from "../graph/htmlRenderNode";

export interface HtmlRenderContext {
}

export class HtmlRenderCommand implements RenderCommand<HtmlResourceManager, HtmlRenderContext>{

    private readonly containerId: string;
    private readonly data: HtmlData[];
    private readonly node: HtmlRenderNode;

    constructor(containerId: string, data: NodeOutput.HtmlData[], node: HtmlRenderNode) {
        this.containerId = containerId;
        this.data = data;
        this.node = node;
    }

    public execute(resourceManager: HtmlResourceManager, context: HtmlRenderContext): void {

        // apply modifications
        const modified = this.node.execute();
        if(modified.elements.size > 0) {
            for(let [modifiedId, modifiedData] of modified.elements) {
                resourceManager.setElements(modifiedId, modifiedData)
            }
        }

        // prepare html-element pool
        let totalCount = 0;
        for (let d of this.data) {
            totalCount += resourceManager.getElements(d.name).length
        }
        const container = resourceManager.getContainer(this.containerId);
        const availableHtmlElements = this.prepareElements(totalCount, container);

        // update elements
        let index = 0;
        for(let d of this.data) {
            const elements = resourceManager.getElements(d.name);
            for (let i = 0; i < elements.length; i++) {
                const htmlElement = availableHtmlElements[index++];
                d.renderFunction(elements[i], htmlElement)
            }
        }

    }

    private prepareElements(required: number, container: HTMLElement): HTMLElement[] {
        const sizeDiff = required - container.childElementCount;

        if (Math.abs(sizeDiff) < 100) {

            if (sizeDiff < 0) {
                for (let i = -sizeDiff; i >= 0; i--) {
                    container.children.item(required + i)?.remove();
                }
            }
            if (sizeDiff > 0) {
                for (let i = 0; i < sizeDiff; i++) {
                    container.appendChild(document.createElement("div"));
                }
            }
            const pool = [...container.children];
            return pool as HTMLElement[];

        } else {

            const elements: HTMLElement[] = []
            for(let i=0; i<required; i++) {
                elements.push(document.createElement("div"))
            }
            container.replaceChildren(...elements);
            return elements
        }

    }

}