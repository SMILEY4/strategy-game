import {RenderGraphNode} from "../renderGraphNode";
import {RenderElementGeneratorOutputDefinition} from "./renderElementGeneratorRenderGraphNode";
import {Camera} from "../../webgl/camera";
import {UID} from "../../uid";

/**
 * "Draw" html elements to a html container.
 */
export class HtmlDrawRenderGraphNode implements RenderGraphNode {

	private source: RenderElementGeneratorOutputDefinition = null as any;
	private cullingRadius: number = 9999999;
	private lowQualityThreshold: number = 9999999;
	private templateFunc: () => HTMLElement = () => undefined as any;
	private renderFunc: (obj: any, target: HTMLElement, lowQuality: boolean, camera: Camera) => void = () => undefined;
	private name: string = UID.generate();


	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): RenderGraphNode {
		this.name = name;
		return this;
	}

	/**
	 * Draw the elements created and defined by the given creator output (required, accepts only one).
	 */
	public withElements(source: RenderElementGeneratorOutputDefinition): HtmlDrawRenderGraphNode {
		this.source = source;
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
	 * Specify the amount of elements after which the low quality flag is set (for all elements)
	 */
	public withLowQualityThreshold(lowQualityThreshold: number): HtmlDrawRenderGraphNode {
		this.lowQualityThreshold = lowQualityThreshold;
		return this;
	}

	/**
	 * Define a function creating a base html element to use as a template (required).
	 */
	public withTemplateFunc(templateFunc: () => HTMLElement): HtmlDrawRenderGraphNode {
		this.templateFunc = templateFunc;
		return this;
	}

	/**
	 * Define a function that transforms the input elements into a html element (required).
	 */
	public withRenderFunc(renderFunc: (obj: any, target: HTMLElement, lowQuality: boolean, camera: Camera) => void): HtmlDrawRenderGraphNode {
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
	 * @return the amount of elements after which the low quality flag is set
	 */
	public getLowQualityThreshold(): number {
		return this.lowQualityThreshold;
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
	public getRenderFunc(): (obj: any, target: HTMLElement, lowQuality: boolean, camera: Camera) => void {
		return this.renderFunc;
	}

	/**
	 * @return the creator output definition
	 */
	public getSource(): RenderElementGeneratorOutputDefinition {
		return this.source;
	}

	getInputs(): RenderGraphNode[] {
		return [this.source.generator];
	}

	getName(): string {
		return this.name;
	}

	validate(): string[] {
		const errors: string[] = [];

		if (this.getInputs().length != 1) {
			errors.push("Exactly one input is required");
		}

		if (this.templateFunc === undefined) {
			errors.push("Template function is required");
		}

		if (this.renderFunc === undefined) {
			errors.push("Render function is required");
		}

		return errors;
	}

}