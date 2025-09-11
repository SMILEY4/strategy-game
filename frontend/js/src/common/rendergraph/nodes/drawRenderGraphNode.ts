import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./vertexDescriptorRenderGraphNode";
import {Camera} from "../../webgl/camera";
import {UID} from "../../uid";
import {RenderGraphProperty} from "./propertyRenderGraphNode";

/**
 * Draw vertex data to a canvas using shaders.
 */
export class DrawRenderGraphNode implements RenderGraphNode {

	private cameraPropertyNode: RenderGraphProperty<Camera> = null as any;
	private vertexDescriptorNode: VertexDescriptorRenderGraphNode = null as any;
	private shaderNode: ShaderRenderGraphNode = null as any;

	private clearColor: [number, number, number, number] = [0, 0, 0, 0];
	private scaling: number = 1;
	private blendFunction: ((gl: WebGL2RenderingContext) => void) | null = null;
	private name: string = UID.generate();


	public withName(name: string): DrawRenderGraphNode {
		this.name = name;
		return this;
	}

	/**
	 * The camera to use (required).
	 */
	public withCamera(camera: RenderGraphProperty<Camera>): DrawRenderGraphNode {
		this.cameraPropertyNode = camera;
		return this;
	}

	/**
	 * The mesh / vertex descriptor to use (required).
	 */
	public withVertexDescriptor(vertexDescriptorNode: VertexDescriptorRenderGraphNode): DrawRenderGraphNode {
		this.vertexDescriptorNode = vertexDescriptorNode;
		return this;
	}

	/**
	 * The shader program to use (required).
	 */
	public withShaderProgram(shaderNode: ShaderRenderGraphNode): DrawRenderGraphNode {
		this.shaderNode = shaderNode;
		return this;
	}

	/**
	 * Specify the clear color. Transparent by default.
	 */
	public withClearColor(color: [number, number, number, number]): DrawRenderGraphNode {
		this.clearColor = color;
		return this;
	}

	/**
	 * Specify the scaling factor. default = "1.0". Higher value = higher quality.
	 */
	public withScaling(scaling: number): DrawRenderGraphNode {
		this.scaling = scaling;
		return this;
	}

	/**
	 * Specify the color blending function.
	 */
	public withBlendFunction(blendFunction: ((gl: WebGL2RenderingContext) => void) | null): DrawRenderGraphNode {
		this.blendFunction = blendFunction;
		return this;
	}

	/**
	 * @return the property providing the camera
	 */
	public getCameraProperty(): RenderGraphProperty<Camera> {
		return this.cameraPropertyNode;
	}

	/**
	 * @return the vertex descriptor node to use
	 */
	public getVertexDescriptorNode(): VertexDescriptorRenderGraphNode {
		return this.vertexDescriptorNode;
	}

	/**
	 * @return the shader program node to use
	 */
	public getShaderNode(): ShaderRenderGraphNode {
		return this.shaderNode;
	}

	/**
	 * @return the clear color
	 */
	public getClearColor(): [number, number, number, number] {
		return this.clearColor;
	}

	/**
	 * @return the scaling factor
	 */
	public getScaling(): number {
		return this.scaling;
	}

	/**
	 * @return the color blending function
	 */
	public getBlendFunction(): ((gl: WebGL2RenderingContext) => void) | null {
		return this.blendFunction;
	}

	validate(): string[] {
		const errors: string[] = [];

		if (this.vertexDescriptorNode == null) {
			errors.push("Vertex descriptor node is required");
		}

		if (this.shaderNode == null) {
			errors.push("Shader node is required");
		}

		if (!this.cameraPropertyNode) {
			errors.push("Camera property is required.");
		}

		return errors;
	}

	getInputs(): RenderGraphNode[] {
		return [this.vertexDescriptorNode, this.shaderNode, this.cameraPropertyNode];
	}

	getName(): string {
		return this.name;
	}

}