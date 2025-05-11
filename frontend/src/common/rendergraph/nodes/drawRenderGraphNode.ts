import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./vertexDescriptorRenderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {Camera} from "../../webgl/camera";

/**
 * Draw vertex data to a canvas using shaders.
 */
export class DrawRenderGraphNode extends RenderGraphNode<DrawRenderGraphNode> {

	private cameraPropertyNode: PropertyRenderGraphNode<Camera> = null as any;
	private clearColor: [number, number, number, number] = [0, 0, 0, 0];
	private scaling: number = 1;
	private blendFunction: ((gl: WebGL2RenderingContext) => void) | null = null;

	/**
	 * The camera to use (required).
	 */
	public withCamera(camera: PropertyRenderGraphNode<Camera>): DrawRenderGraphNode {
		this.cameraPropertyNode = camera;
		this.registerInput(camera);
		return this;
	}

	/**
	 * The mesh / vertex descriptor to use (required).
	 */
	public withVertexDescriptor(vertexDescriptorNode: VertexDescriptorRenderGraphNode): DrawRenderGraphNode {
		this.registerInput(vertexDescriptorNode);
		return this;
	}

	/**
	 * The shader program to use (required).
	 */
	public withShaderProgram(shaderNode: ShaderRenderGraphNode): DrawRenderGraphNode {
		this.registerInput(shaderNode);
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
	public getCameraProperty(): PropertyRenderGraphNode<Camera> {
		return this.cameraPropertyNode;
	}

	/**
	 * @return the vertex descriptor node to use
	 */
	public getVertexDescriptorNode(): VertexDescriptorRenderGraphNode {
		return this
			.getInputs()
			.find(VertexDescriptorRenderGraphNode.isType)!!
	}

	/**
	 * @return the shader program node to use
	 */
	public getShaderNode(): ShaderRenderGraphNode {
		return this
			.getInputs()
			.find(ShaderRenderGraphNode.isType)!!
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

		if(this.getInputs().count(ShaderRenderGraphNode.isType) != 1) {
			errors.push("Exactly one shader node is required")
		}

		if(this.getInputs().count(VertexDescriptorRenderGraphNode.isType) != 1) {
			errors.push("Exactly one vertex descriptor node is required")
		}

		if(!this.cameraPropertyNode) {
			errors.push("Camera property is required.");
		}

		return errors;
	}

}