/**
 * Definition for an output of a render graph node
 */
export abstract class RenderGraphNodeOutputDefinition {
	/**
	 * A unique id for this dependency. Used to connect this output with the input definition with the matching id.
	 */
	abstract getDependencyId(): string
}