import {RenderGraphResourceManager} from "./renderGraphResourceManager";

/**
 * Base type representing a node in a render graph.
 */
export interface RenderGraphNode {
	getName(): string;
	getInputs(): RenderGraphNode[];
	validate(): string[];
	getChangeTest(): (resourceManager: RenderGraphResourceManager) => boolean;
}

export namespace RenderGraphNode {
	export const NOOP_CHANGE_TEST: (resourceManager: RenderGraphResourceManager) => boolean = () => false
}