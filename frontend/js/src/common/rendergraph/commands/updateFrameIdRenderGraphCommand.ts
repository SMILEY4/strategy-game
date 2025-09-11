import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UID} from "../../uid";

export class UpdateFrameIdRenderGraphCommand extends RenderGraphCommand {

	constructor(private readonly frameIdName: string) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		resourceManager.updateResource(this.frameIdName, UID.generate());
	}

	getDebugData(): object {
		return {
			command: "UpdateFrameId",
		};
	}
}