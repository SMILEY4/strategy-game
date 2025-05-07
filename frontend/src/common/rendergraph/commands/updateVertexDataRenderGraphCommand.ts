import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {RenderGraphKeys} from "../renderGraphKeys";
import {VertexMetaInfo} from "../nodes/vertexDescriptorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";

/**
 * Update the vertex data returned by the given function.
 * Skipped if the given condition evaluates to "false".
 */
export class UpdateVertexDataRenderGraphCommand extends RenderGraphCommand {

	private readonly creatorName: string;
	private readonly creationFunc: (context: RenderGraphNodeContext) => VertexCreatorRenderGraphNode.VertexCreationFuncResult;
	private readonly execCondition: () => boolean;
	private readonly propertyMapping: Map<string, string>;

	constructor(
		creatorName: string,
		creationFunc: (context: RenderGraphNodeContext) => VertexCreatorRenderGraphNode.VertexCreationFuncResult,
		execCondition: () => boolean,
		propertyMapping: Map<string, string>
	) {
		super();
		this.creatorName = creatorName;
		this.creationFunc = creationFunc;
		this.execCondition = execCondition;
		this.propertyMapping = propertyMapping;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition() && !forceExecute) {
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