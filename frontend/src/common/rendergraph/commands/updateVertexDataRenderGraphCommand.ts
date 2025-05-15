import {VertexGeneratorResult} from "../nodes/vertexGeneratorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {VertexMetaInfo} from "../resources/vertexMetaInfo";

export class UpdateVertexDataRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly creatorName: string,
		private readonly creationFunc: (context: RenderGraphNodeContext) => Map<string, VertexGeneratorResult>,
		private readonly execCondition: (resourceManager: RenderGraphResourceManager) => boolean,
		private readonly propertyMapping: Map<string, string>,
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition(resourceManager) && !forceExecute) {
			return;
		}

		const context = new RenderGraphNodeContext(resourceManager, this.propertyMapping);
		const result = this.creationFunc(context);
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