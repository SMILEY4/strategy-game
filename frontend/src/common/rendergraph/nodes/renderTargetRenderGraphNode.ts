import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";
import {PropertyRenderGraphNodeUtils, RenderGraphProperty} from "./propertyRenderGraphNode";
import {GLUniformType} from "../../webgl/glTypes";
import {UID} from "../../uid";

/**
 * Represents an offscreen canvas / texture that can be drawn to using shaders and meshes.
 */
export class RenderTargetRenderGraphNode implements RenderGraphNode, RenderGraphProperty<number> {

	private readonly drawNodes: DrawRenderGraphNode[] = [];
	private enableDepth: boolean = false;
	private name: string = UID.generate();

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): RenderTargetRenderGraphNode {
		this.name = name
		return this;
	}

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
		this.drawNodes.push(input);
		return this;
	}

	/**
	 * @return whether depth buffer and testing is enabled.
	 */
	public getEnableDepth(): boolean {
		return this.enableDepth;
	}

	getName(): string {
		return this.name;
	}

	getInputs(): RenderGraphNode[] {
		return this.drawNodes;
	}

	getType(): GLUniformType | null {
		return GLUniformType.SAMPLER_2D;
	}

	getValueProvider(context: any): () => number {
		if (context) {
			const boundTextures: Map<RenderGraphNode, number> = context;
			return () => boundTextures.get(this)!;
		} else {
			return () => -1;
		}
	}

	getChangeTest(): () => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(
			this.drawNodes.map(it => it.getChangeTest())
		);
	}

	validate(): string[] {
		return [];
	}

}