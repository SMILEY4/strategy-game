import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {RenderGraphKeys} from "../renderGraphKeys";
import {VertexMetaInfo} from "../nodes/vertexDescriptorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {ProgrammableNodeContext} from "../nodes/programmableRenderGraphNode";

/**
 * Update the vertex data returned by the given function.
 * Skipped if the given condition evaluates to "false".
 */
export class UpdateVertexDataRenderGraphCommand extends RenderGraphCommand {

	private readonly creatorName: string;
	private readonly creationFunc: (context: ProgrammableNodeContext) => VertexCreatorRenderGraphNode.VertexCreationFuncResult;
	private readonly execCondition: () => boolean;
	private readonly context: ProgrammableNodeContext;

	constructor(
		creatorName: string,
		creationFunc: (context: ProgrammableNodeContext) => VertexCreatorRenderGraphNode.VertexCreationFuncResult,
		execCondition: () => boolean,
		context: ProgrammableNodeContext,
	) {
		super();
		this.creatorName = creatorName;
		this.creationFunc = creationFunc;
		this.execCondition = execCondition;
		this.context = context;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition() && !forceExecute) {
			return;
		}

		const result = this.creationFunc(this.context);
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