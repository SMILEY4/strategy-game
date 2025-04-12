import {IntermediateRenderGraphCommand} from "./intermediateRenderGraphCommand";

export abstract class RenderGraphNode {
	public abstract getInputs(): RenderGraphNode[]
	public abstract validate(): string[]
	public abstract preCompile(): IntermediateRenderGraphCommand[]
}