/**
 * Base type representing a node in a render graph.
 */
export interface RenderGraphNode {
	getName(): string;
	getInputs(): RenderGraphNode[];
	validate(): string[];
}