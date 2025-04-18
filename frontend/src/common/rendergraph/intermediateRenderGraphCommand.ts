import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";

export abstract class IntermediateRenderGraphCommand {
	public abstract toDebugString(): string;
}

export namespace IntermediateRenderGraphCommand {

	export class UpdateVertexData extends IntermediateRenderGraphCommand{
		private readonly node: VertexCreatorRenderGraphNode;
		constructor(node: VertexCreatorRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "UpdateVertexData: " + this.node.getTags().join(", ");
		}
	}

	export class BindTexture  extends IntermediateRenderGraphCommand{
		private readonly node: TextureRenderGraphNode;
		constructor(node: TextureRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindTexture: " + this.node.getTags().join(", ");
		}
	}

	export class BindVertexArray extends IntermediateRenderGraphCommand {
		private readonly node: VertexDescriptorRenderGraphNode;
		constructor(node: VertexDescriptorRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindVertexArray: " + this.node.getTags().join(", ");
		}
	}

	export class BindFramebuffer extends IntermediateRenderGraphCommand {
		private readonly node: RenderTargetRenderGraphNode;
		constructor(node: RenderTargetRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindFramebuffer: " + this.node.getTags().join(", ");
		}
	}

	export class UnbindFramebuffer  extends IntermediateRenderGraphCommand{
		private readonly node: RenderTargetRenderGraphNode;
		constructor(node: RenderTargetRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "UnbindFramebuffer: " + this.node.getTags().join(", ");
		}
	}

	export class SetUniforms  extends IntermediateRenderGraphCommand{
		private readonly node: ShaderRenderGraphNode;
		constructor(node: ShaderRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "SetUniforms: " + this.node.getTags().join(", ");
		}
	}

	export class UseShader  extends IntermediateRenderGraphCommand{
		private readonly node: ShaderRenderGraphNode;
		constructor(node: ShaderRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "UseShader: " + this.node.getTags().join(", ");
		}
	}

	export class DrawCall  extends IntermediateRenderGraphCommand{
		private readonly node: ShaderRenderGraphNode;
		constructor(node: ShaderRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "DrawCall: " + this.node.getTags().join(", ");
		}
	}

}