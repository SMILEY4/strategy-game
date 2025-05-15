import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";
import {TextureRenderGraphNode} from "./textureRenderGraphNode";
import {RenderGraphProperty} from "./propertyRenderGraphNode";
import {GLUniformType} from "../../webgl/glTypes";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

/**
 * Represents a collection of textures where one can be active at any time depending on given conditions
 */
export class ConditionalTextureRenderGraphNode implements RenderGraphNode, RenderGraphProperty<number> {

	private readonly options: ({ texture: TextureRenderGraphNode, condition: () => boolean })[] = [];
	private name: string = UID.generate();


	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): ConditionalTextureRenderGraphNode {
		this.name = name;
		return this;
	}

	public withOption(texture: TextureRenderGraphNode, condition: () => boolean): ConditionalTextureRenderGraphNode {
		this.options.push({
			texture: texture,
			condition: condition,
		});
		return this;
	}

	public getOptions(): ({ texture: TextureRenderGraphNode, condition: () => boolean })[] {
		return this.options;
	}

	validate(): string[] {
		const errors: string[] = [];
		if (this.options.length == 0) {
			errors.push("At least one option must be available");
		}
		return errors;
	}

	getInputs(): RenderGraphNode[] {
		return this.options.map(it => it.texture);
	}

	getName(): string {
		return this.name;
	}

	getChangeTest(): (resourceManager: RenderGraphResourceManager) => boolean {
		return RenderGraphNode.NOOP_CHANGE_TEST;
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

}