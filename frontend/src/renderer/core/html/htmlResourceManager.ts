import {ResourceManager} from "../graph/resourceManager";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {HtmlRenderNode} from "../graph/htmlRenderNode";
import {NodeOutput} from "../graph/nodeOutput";

export class HtmlResourceManager implements ResourceManager {

    private elementCache = new Map<string, any[]>();
    private containerCache = new Map<string, HTMLElement>();

    public initialize(nodes: AbstractRenderNode[]): void {
        for (let node of nodes) {
            if(node instanceof HtmlRenderNode) {
                for (let output of node.config.output) {
                    if(output instanceof NodeOutput.HtmlData) {
                        this.elementCache.set(output.name, [])
                    }
                    if(output instanceof NodeOutput.HtmlContainer) {
                        // todo: optionally init container cache
                    }
                }
            }
        }
    }

    public dispose(): void {
        this.elementCache.clear();
        this.containerCache.clear();
    }

    public getElements(id: string): any[] {
        const elements = this.elementCache.get(id);
        if(elements === undefined || elements === null) {
            throw new Error("No elements with id " + id)
        } else {
            return elements;
        }
    }

    public setElements(id: string, elements: any[]) {
        this.elementCache.set(id, elements)
    }

    public getContainer(containerName: string): HTMLElement {
        let container = this.containerCache.get(containerName);
        if(!container) {
            container = document.getElementById(containerName)!;
            this.containerCache.set(containerName, container)
        }
        if(!container) {
            throw new Error("No container with name " + containerName);
        }
        return container;
    }

}