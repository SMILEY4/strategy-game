import {RenderGraphNode} from "../renderGraphNode";
import {ElementCreatorRenderGraphNode} from "./elementCreatorRenderGraphNode";
import {Camera} from "../../webgl/camera";

export class HtmlDrawRenderGraphNode extends RenderGraphNode<HtmlDrawRenderGraphNode> {

	private source: ElementCreatorRenderGraphNode.Output = null as any;
	private cullingRadius: number = 9999999;
	private templateFunc: () => HTMLElement = () => undefined as any;
	private renderFunc: (obj: any, target: HTMLElement, camera: Camera) => void = () => undefined;

	public withElements(output: ElementCreatorRenderGraphNode.Output): HtmlDrawRenderGraphNode {
		this.source = output;
		return this;
	}

	public withCullingRadius(cullingRadius: number): HtmlDrawRenderGraphNode {
		this.cullingRadius = cullingRadius;
		return this;
	}

	public withTemplateFunc(templateFunc: () => HTMLElement): HtmlDrawRenderGraphNode{
		this.templateFunc = templateFunc;
		return this;
	}

	public withRenderFunc(renderFunc: (obj: any, target: HTMLElement, camera: Camera) => void): HtmlDrawRenderGraphNode {
		this.renderFunc = renderFunc;
		return this;
	}

	public getCullingRadius(): number {
		return this.cullingRadius;
	}

	public getTemplateFunc(): () => HTMLElement {
		return this.templateFunc;
	}

	public getRenderFunc(): (obj: any, target: HTMLElement, camera: Camera) => void {
		return this.renderFunc;
	}

	public getSource(): ElementCreatorRenderGraphNode.Output {
		return this.source;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [this.source.creator];
	}

}