import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {RenderGraphKeys} from "../renderGraphKeys";
import {VertexMetaInfo} from "../nodes/vertexDescriptorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";

export class UpdateVertexDataRenderGraphCommand extends RenderGraphCommand {

	private readonly creatorName: string;
	private readonly creationFunc: VertexCreatorRenderGraphNode.CreationFunc;

	constructor(creatorName: string, creationFunc: VertexCreatorRenderGraphNode.CreationFunc) {
		super();
		this.creatorName = creatorName;
		this.creationFunc = creationFunc;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const result = this.creationFunc();
		for (let [key, {data, entryCount}] of result) {

			const buffer = resourceManager.getResource<GLVertexBuffer>(RenderGraphKeys.vertexBufferFromName(this.creatorName, key));
			buffer.setData(data, true);

			const vertexInfo = resourceManager.getResource<VertexMetaInfo>(RenderGraphKeys.vertexInfoFromName(this.creatorName, key));
			vertexInfo.entryCount = entryCount;

		}
	}

	getDebugData(): object {
		return {
			command: "UpdateVertexData",
			creator: this.creatorName,
		};
	}
}