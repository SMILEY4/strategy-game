import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLVertexArray} from "../../webgl/glVertexArray";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Binds the vertex array with the given name.
 */
export class BindVertexArrayRenderGraphCommand extends RenderGraphCommand {
	private readonly vertexArrayName: string;

	constructor(vertexArrayName: string) {
		super();
		this.vertexArrayName = vertexArrayName;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const vertexArray = resourceManager.getResource<GLVertexArray>(this.vertexArrayName);
		vertexArray.bind();
	}

	getDebugData(): object {
		return {
			command: "BindVertexArray",
			vertexArrayName: this.vertexArrayName,
		};
	}
}