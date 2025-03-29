/**
 * Definition for an input of a render graph node
 */
export abstract class RenderGraphNodeInputDefinition {
	/**
	 * A unique id for this dependency. Used to connect this input with the output definition with the matching id.
	 */
	abstract getDependencyId(): string

	/**
	 * Ids of resources that can be shared. Usage of shared resources are clustered together.
	 */
	abstract getSharedResourceIds(): string[]

	/**
	 * Change keys of this node input
	 */
	abstract getChangeKeys(): string[];
}