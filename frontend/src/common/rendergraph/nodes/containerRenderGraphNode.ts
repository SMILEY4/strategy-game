import {HtmlDrawRenderGraphNode} from "./htmlDrawRenderGraphNode";
import {Camera} from "../../webgl/camera";
import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";
import {RenderGraphProperty} from "./propertyRenderGraphNode";

/**
 * Represents a html container that can be drawn to using html elements
 */
export class ContainerRenderGraphNode implements RenderGraphNode {

	private drawNodes: HtmlDrawRenderGraphNode[] = [];
	private elementId: string = "";
	private cameraPropertyNode: RenderGraphProperty<Camera> = null as any;
	private name: string = UID.generate();


	/**
	 * Output the result of the given draw node to this canvas
	 */
	public withInput(node: HtmlDrawRenderGraphNode): ContainerRenderGraphNode {
		this.drawNodes.push(node)
		return this;
	}

	/**
	 * The id of the html container element to use as the container (required).
	 */
	public withElementId(id: string): ContainerRenderGraphNode {
		this.elementId = id;
		return this;
	}

	/**
	 * The camera to use (required).
	 */
	public withCamera(camera: RenderGraphProperty<Camera>): ContainerRenderGraphNode {
		this.cameraPropertyNode = camera;
		return this;
	}

	public withName(name: string): ContainerRenderGraphNode {
		this.name = name
		return this;
	}

	/**
	 * @return the id of the html element to use as the container
	 */
	public getElementId(): string {
		return this.elementId;
	}

	/**
	 * @return the list of nodes outputting to this container
	 */
	public getDrawNodes(): HtmlDrawRenderGraphNode[] {
		return this.drawNodes
	}

	/**
	 * @return the property providing the camera
	 */
	public getCameraProperty(): RenderGraphProperty<Camera> {
		return this.cameraPropertyNode;
	}

	validate(): string[] {
		const errors: string[] = [];
		if (!this.elementId) {
			errors.push("Html element id is required and must be valid.");
		}
		if (!this.cameraPropertyNode) {
			errors.push("Camera property is required.");
		}
		return errors;
	}

	getInputs(): RenderGraphNode[] {
		return [...this.drawNodes, this.cameraPropertyNode];
	}

	getName(): string {
		return this.name;
	}

	getChangeTest(): () => boolean {
		return () => false
	}

}
