import {RenderGraphNode} from "../nodes/renderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";

export interface RenderGraphNodeCompiler {

	/**
	 * Whether this compiler can handle the given node
	 */
	handles(node: RenderGraphNode): boolean;

	/**
	 * Validate the given node. Returns a list of validation errors.
	 */
	validate(node: RenderGraphNode): string[];

	/**
	 * Generates a list of commands for the given node
	 * @param renderGraphNode the node to compile
	 * @param previousCommands the already generated commands from previous nodes
	 * @return the generated commands for the given node
	 */
	compile(renderGraphNode: RenderGraphNode, previousCommands: RenderGraphCommand[]): RenderGraphCommand[];

}