import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {DrawRenderGraphNode} from "./nodes/drawRenderGraphNode";

export abstract class RenderGraphCommand {
	public abstract toDebugString(): string;
}

export namespace RenderGraphCommand {

	export class UpdateVertexData extends RenderGraphCommand{
		private readonly node: VertexCreatorRenderGraphNode;
		constructor(node: VertexCreatorRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "UpdateVertexData: " + this.node.getTags().join(", ");
		}
	}

	export class BindTexture  extends RenderGraphCommand{
		private readonly node: TextureRenderGraphNode;
		constructor(node: TextureRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindTexture: " + this.node.getTags().join(", ");
		}
	}

	export class BindFramebufferTexture  extends RenderGraphCommand{
		private readonly node: RenderTargetRenderGraphNode;
		constructor(node: RenderTargetRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindFramebufferTexture: " + this.node.getTags().join(", ");
		}
	}

	export class BindVertexArray extends RenderGraphCommand {
		private readonly node: VertexDescriptorRenderGraphNode;
		constructor(node: VertexDescriptorRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindVertexArray: " + this.node.getTags().join(", ");
		}
	}

	export class BindFramebuffer extends RenderGraphCommand {
		private readonly node: RenderTargetRenderGraphNode;
		constructor(node: RenderTargetRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "BindFramebuffer: " + this.node.getTags().join(", ");
		}
	}

	export class UnbindFramebuffer  extends RenderGraphCommand{
		private readonly node: RenderTargetRenderGraphNode;
		constructor(node: RenderTargetRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "UnbindFramebuffer: " + this.node.getTags().join(", ");
		}
	}

	export class SetUniforms  extends RenderGraphCommand{
		private readonly node: ShaderRenderGraphNode;
		constructor(node: ShaderRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "SetUniforms: " + this.node.getTags().join(", ");
		}
	}

	export class UseShader  extends RenderGraphCommand{
		private readonly node: ShaderRenderGraphNode;
		constructor(node: ShaderRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "UseShader: " + this.node.getTags().join(", ");
		}
	}

	export class DrawCall  extends RenderGraphCommand{
		private readonly node: DrawRenderGraphNode;
		constructor(node: DrawRenderGraphNode) {
			super();
			this.node = node;
		}
		toDebugString(): string {
			return "DrawCall: " + this.node.getTags().join(", ");
		}
	}

}