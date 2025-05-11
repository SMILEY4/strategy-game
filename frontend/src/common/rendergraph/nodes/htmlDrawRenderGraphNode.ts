import {RenderGraphNode} from "../renderGraphNode";
import {ElementCreatorRenderGraphNode} from "./elementCreatorRenderGraphNode";
import {Camera} from "../../webgl/camera";

/**
 * "Draw" html elements to a html container.
 */
export class HtmlDrawRenderGraphNode extends RenderGraphNode<HtmlDrawRenderGraphNode> {

	private source: ElementCreatorRenderGraphNode.Output = null as any;
	private cullingRadius: number = 9999999;
	private templateFunc: () => HTMLElement = () => undefined as any;
	private renderFunc: (obj: any, target: HTMLElement, camera: Camera) => void = () => undefined;

	/**
	 * Draw the elements created and defined by the given creator output (required, accepts only one).
	 */
	public withElements(source: ElementCreatorRenderGraphNode.Output): HtmlDrawRenderGraphNode {
		this.source = source;
		this.registerInput(source.creator)
		return this;
	}

	/**
	 * Specify the approximate max radius of the html elements in tiles.
	 * Used to determine which elements are visible and which are off-screen.
	 */
	public withCullingRadius(cullingRadius: number): HtmlDrawRenderGraphNode {
		this.cullingRadius = cullingRadius;
		return this;
	}

	/**
	 * Define a function creating a base html element to use as a template (required).
	 */
	public withTemplateFunc(templateFunc: () => HTMLElement): HtmlDrawRenderGraphNode{
		this.templateFunc = templateFunc;
		return this;
	}

	/**
	 * Define a function that transforms the input elements into a html element (required).
	 */
	public withRenderFunc(renderFunc: (obj: any, target: HTMLElement, camera: Camera) => void): HtmlDrawRenderGraphNode {
		this.renderFunc = renderFunc;
		return this;
	}

	/**
	 * @return the culling radius in tiles used to determine element visibility.
	 */
	public getCullingRadius(): number {
		return this.cullingRadius;
	}

	/**
	 * @return the template function
	 */
	public getTemplateFunc(): () => HTMLElement {
		return this.templateFunc;
	}

	/**
	 * @return the render function
	 */
	public getRenderFunc(): (obj: any, target: HTMLElement, camera: Camera) => void {
		return this.renderFunc;
	}

	/**
	 * @return the creator output definition
	 */
	public getSource(): ElementCreatorRenderGraphNode.Output {
		return this.source;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [this.source.creator];
	}

	validate(): string[] {
		const errors: string[] = [];

		if(this.getInputs().count(ElementCreatorRenderGraphNode.isType) != 1) {
			errors.push("Exactly one source / creator output is required")
		}

		if(this.templateFunc === undefined) {
			errors.push("Template function is required")
		}

		if(this.renderFunc === undefined) {
			errors.push("Render function is required")
		}

		return errors;
	}

}

export namespace HtmlDrawRenderGraphNode {

	export function isType(node: RenderGraphNode<any>): node is HtmlDrawRenderGraphNode {
		return node instanceof HtmlDrawRenderGraphNode;
	}

}