import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

/**
 * Represents an offscreen canvas / texture that can be drawn to using shaders and meshes.
 */
export class RenderTargetRenderGraphNode extends RenderGraphNode<RenderTargetRenderGraphNode> {

	private enableDepth: boolean = false;

	/**
	 * Whether to use the depth buffer and testing (disabled by default)
	 */
	public withDepth(enableDepth: boolean = true): RenderTargetRenderGraphNode {
		this.enableDepth = enableDepth;
		return this;
	}

	/**
	 * Output the result of the given draw node to this canvas
	 */
	public withInput(input: DrawRenderGraphNode): RenderTargetRenderGraphNode {
		this.registerInput(input)
		return this;
	}

	/**
	 * @return whether depth buffer and testing is enabled.
	 */
	public getEnableDepth(): boolean {
		return this.enableDepth;
	}

	validate(): string[] {
		return [];
	}

}