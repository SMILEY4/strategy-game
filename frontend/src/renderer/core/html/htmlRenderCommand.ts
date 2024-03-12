import {RenderCommand} from "../graph/renderCommand";
import {HtmlResourceManager} from "./htmlResourceManager";
import {NodeOutput} from "../graph/nodeOutput";
import {HtmlRenderNode} from "../graph/htmlRenderNode";
import HtmlData = NodeOutput.HtmlData;

export namespace HtmlRenderCommand {

    export interface Context {
    }

    export interface Base extends RenderCommand<HtmlResourceManager, Context> {
    }


    export class UpdateData implements Base {

        private readonly node: HtmlRenderNode;

        constructor(node: HtmlRenderNode) {
            this.node = node;
        }

        public execute(resourceManager: HtmlResourceManager, context: Context): void {
            const modified = this.node.execute();
            if (modified.elements.size > 0) {
                for (let [modifiedId, modifiedData] of modified.elements) {
                    resourceManager.setElements(modifiedId, modifiedData);
                }
            }
        }

    }


    export class Draw implements Base {

        private readonly containerId: string;
        private readonly nodes: HtmlRenderNode[];

        constructor(containerId: string, nodes: HtmlRenderNode[]) {
            this.containerId = containerId;
            this.nodes = nodes;
        }

        public execute(resourceManager: HtmlResourceManager, context: Context): void {

            // prepare html-element pool
            let totalCount = 0;
            for (let node of this.nodes) {
                for (let out of node.config.output) {
                    if(out instanceof HtmlData) {
                        totalCount += resourceManager.getElements(out.name).length
                    }
                }
            }
            const container = resourceManager.getContainer(this.containerId);
            const availableHtmlElements = this.prepareElements(totalCount, container);

            // update elements
            let index = 0;
            for (let node of this.nodes) {
                for (let out of node.config.output) {
                    if(out instanceof HtmlData) {
                        const elements = resourceManager.getElements(out.name)
                        for (let i = 0; i < elements.length; i++) {
                            const htmlElement = availableHtmlElements[index++];
                            out.renderFunction(elements[i], htmlElement);
                        }
                    }
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

                const elements: HTMLElement[] = [];
                for (let i = 0; i < required; i++) {
                    elements.push(document.createElement("div"));
                }
                container.replaceChildren(...elements);
                return elements;
            }

        }

    }

}
