import {RenderGraphNode} from "./renderGraphNode";

/**
 * Sorts the render graph nodes into a valid order.
 */
export class RenderGraphSorter {

	/**
	 * Sorts the render graph nodes into an order that respects dependencies between them.
	 */
	public sort(nodes: RenderGraphNode<any>[]): RenderGraphNode<any>[] {
		return this.topologicalSort(nodes).flatMap(group => group);
	}

	/**
	 * Perform a simple topological order on the given nodes.
	 * Returns the ordered nodes. Nodes for which the order does not matter are grouped together.
	 * e.g. for the graph ("a" and "b" are inputs of "c", i.e. "c" depends on "a" and "b")
	 * 			a---|
	 * 			    |--> c
	 * 			b---|
	 * this function returns [ [ a, b ], [ c ] ].
	 */
	private topologicalSort(nodes: RenderGraphNode<any>[]): (RenderGraphNode<any>[])[] {
		const sorted: (RenderGraphNode<any>[])[] = [];
		let openNodes = [...nodes];

		// nodes that have no inputs that are in given list
		function findFreeNodes(nodes: RenderGraphNode<any>[]): RenderGraphNode<any>[] {
			return nodes.filter(current => {
				return !current.getInputs().some(dependency => nodes.indexOf(dependency) !== -1);
			});
		}

		while (openNodes.length > 0) {
			// find all nodes that do not depend on any node (that is still in the open set)
			const freeNodes = findFreeNodes(openNodes);
			// remove free nodes from open set
			openNodes = openNodes.filter(open => !freeNodes.includes(open));
			// append free nodes to sorted list
			sorted.push(freeNodes);
		}

		return sorted;
	}

}