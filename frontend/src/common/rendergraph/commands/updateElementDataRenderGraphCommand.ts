import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {ProgrammableNodeContext} from "../nodes/programmableRenderGraphNode";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import ElementData = ElementCreatorRenderGraphNode.ElementData;
import {RenderGraphCommand} from "../renderGraphCommand";

export class UpdateElementDataRenderGraphCommand extends RenderGraphCommand {

	private readonly creatorName: string;
	private readonly creationFunc: (context: ProgrammableNodeContext) => ElementCreatorRenderGraphNode.ElementCreationFuncResult;
	private readonly execCondition: () => boolean;
	private readonly context: ProgrammableNodeContext;

	constructor(
		creatorName: string,
		creationFunc: (context: ProgrammableNodeContext) => ElementCreatorRenderGraphNode.ElementCreationFuncResult,
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
		for (let [key, data] of result) {
			const elementData = resourceManager.getResource<ElementData>(RenderGraphKeys.elementsDataFromName(this.creatorName, key));
			elementData.elements = data;
		}
	}

	getDebugData(): object {
		return {
			command: "UpdateElementData",
			creator: this.creatorName,
		};
	}
}