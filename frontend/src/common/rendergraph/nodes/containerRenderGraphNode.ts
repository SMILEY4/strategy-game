import {RenderGraphNode} from "../renderGraphNode";
import {HtmlDrawRenderGraphNode} from "./htmlDrawRenderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {Camera} from "../../webgl/camera";

/**
 * Represents a html container that can be drawn to using html elements
 */
export class ContainerRenderGraphNode extends RenderGraphNode<ContainerRenderGraphNode> {

	private id: string = "";
	private cameraPropertyNode: PropertyRenderGraphNode<Camera> = null as any;

	/**
	 * Output the result of the given draw node to this canvas
	 */
	public withInput(node: HtmlDrawRenderGraphNode): ContainerRenderGraphNode {
		this.registerInput(node);
		return this;
	}

	/**
	 * The id of the html container element to use as the container (required).
	 */
	public withElementId(id: string): ContainerRenderGraphNode {
		this.id = id;
		return this;
	}

	/**
	 * The camera to use (required).
	 */
	public withCamera(camera: PropertyRenderGraphNode<Camera>): ContainerRenderGraphNode {
		this.cameraPropertyNode = camera;
		this.registerInput(camera);
		return this;
	}

	/**
	 * @return the id of the html element to use as the container
	 */
	public getElementId(): string {
		return this.id;
	}

	/**
	 * @return the list of nodes outputting to this container
	 */
	public getRenderNodes(): HtmlDrawRenderGraphNode[] {
		return this
			.getInputs()
			.filter(HtmlDrawRenderGraphNode.isType);
	}

	/**
	 * @return the property providing the camera
	 */
	public getCameraProperty(): PropertyRenderGraphNode<Camera> {
		return this.cameraPropertyNode;
	}

	validate(): string[] {
		const errors: string[] = [];
		if (!this.id) {
			errors.push("Html element id is required and must be valid.");
		}
		if (!this.cameraPropertyNode) {
			errors.push("Camera property is required.");
		}
		return errors;
	}

}
