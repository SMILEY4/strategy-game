import {ResourceManager} from "../graph/resourceManager";
import {AbstractRenderNode} from "../graph/nodes/abstractRenderNode";
import {HtmlDataEntry, HtmlNode} from "../graph/nodes/htmlNode";
import {HtmlOutputNode} from "../graph/nodes/htmlOutputNode";
import {NodeOutput} from "../graph/nodes/nodeOutput";
import {NodeInput} from "../graph/nodes/nodeInput";

export class HtmlResourceManager implements ResourceManager {

	private dataBuffers = new Map<string, HtmlDataEntry[]>();
	private templates = new Map<string, HTMLElement>();
	private htmlPool = new Map<string, HTMLElement[]>();
	private containers = new Map<string, HTMLElement>();

	public initialize(nodes: RenderNode[]): void {
		for (let node of nodes) {

			if (node instanceof HtmlNode) {
				for (let output of node.config.output) {
					if (output instanceof NodeOutput.HtmlData) {
						this.dataBuffers.set(output.name, []);
					}
				}
			}

			if (node instanceof HtmlOutputNode) {
				for (let input of node.config.input) {
					if (input instanceof NodeInput.HtmlData) {
						this.dataBuffers.set(input.name, []);
					}
				}
				for (let output of node.config.output) {
					const container = document.getElementById(output.id);
					if (container) {
						this.containers.set(output.id, container);
					}
				}
			}

		}
	}

	public dispose(): void {
		this.dataBuffers.clear();
	}

	public setData(id: string, data: HtmlDataEntry[]) {
		this.dataBuffers.set(id, data);
	}

	public getData(id: string): HtmlDataEntry[] {
		const data = this.dataBuffers.get(id);
		if (data) {
			return data;
		} else {
			return [];
		}
	}

	public setTemplateElement(id: string, template: HTMLElement) {
		this.templates.set(id, template);
	}

	public getTemplateElement(id: string): HTMLElement | null {
		const template = this.templates.get(id);
		if(template) {
			return template
		} else {
			return null;
		}
	}

	public setPooledHtmlElements(id: string, data: HTMLElement[]) {
		this.htmlPool.set(id, data);
	}

	public getPooledHtmlElements(id: string): HTMLElement[] {
		const data = this.htmlPool.get(id);
		if (data) {
			return data;
		} else {
			return [];
		}
	}

	public getContainer(containerName: string): HTMLElement {
		let container = this.containers.get(containerName);
		if (!container) {
			container = document.getElementById(containerName)!;
			this.containers.set(containerName, container);
		}
		if (!container) {
			throw new Error("No container with name " + containerName);
		}
		return container;
	}

	// public getElements(id: string): any[] {
	//     const elements = this.elementCache.get(id);
	//     if (elements === undefined || elements === null) {
	//         throw new Error("No elements with id " + id);
	//     } else {
	//         return elements;
	//     }
	// }

	//

}