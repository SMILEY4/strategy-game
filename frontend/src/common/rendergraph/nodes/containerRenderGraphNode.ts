import {RenderGraphNode} from "../renderGraphNode";
import {HtmlDrawRenderGraphNode} from "./htmlDrawRenderGraphNode";

export class ContainerRenderGraphNode extends RenderGraphNode<ContainerRenderGraphNode> {

	private id: string = "";
	private readonly renderNodes: HtmlDrawRenderGraphNode[] = [];


	public withInput(node: HtmlDrawRenderGraphNode): ContainerRenderGraphNode {
		this.renderNodes.push(node);
		return this;
	}

	public withElementId(id: string): ContainerRenderGraphNode {
		this.id = id;
		return this;
	}

	public getElementId(): string {
		return this.id;
	}

	public getRenderNodes(): HtmlDrawRenderGraphNode[] {
		return this.renderNodes;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.renderNodes;
	}

}

export namespace ContainerRenderGraphNode {

	export interface PooledHtmlElementData {
		elements: HTMLElement[];
		templateElement: HTMLElement | null;
	}

	export interface CachedHtmlElement {
		id: string,
		element: HTMLElement | null;
	}

}