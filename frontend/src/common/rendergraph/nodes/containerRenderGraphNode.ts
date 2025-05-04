import {RenderGraphNode} from "../renderGraphNode";
import {HtmlDrawRenderGraphNode} from "./htmlDrawRenderGraphNode";

export class ContainerRenderGraphNode extends RenderGraphNode<ContainerRenderGraphNode> {

	private id: string = "";

	public withInput(node: HtmlDrawRenderGraphNode): ContainerRenderGraphNode {
		this.registerInput(node)
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
		return this
			.getInputs()
			.filter(HtmlDrawRenderGraphNode.isType);
	}

	validate(): string[] {
		if(!this.id) {
			return ["id must be valid (id='" + this.id + "')."];
		}
		return [];
	}


}
