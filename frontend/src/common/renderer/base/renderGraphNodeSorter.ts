import {RenderGraphNode} from "../nodes/renderGraphNode";

interface SortableRenderGraphNode {
	/**
	 * id of this node
	 */
	id: string,
	/**
	 * ids of nodes that depend on this node.
	 */
	dependencies: string[],
	/**
	 * ids of required resources that can be shared with other nodes. Nodes with common resources are clustered together.
	 */
	sharedResources: string[],
}

/**
 * Resolves dependencies and preferences of the given nodes and brings them into a valid sequence.
 */
export class RenderGraphNodeSorter {

	/**
	 * Sort the given input nodes by resolving dependencies and preferences
	 */
	sort(nodes: RenderGraphNode[]): RenderGraphNode[] {

		const sortableNodes: SortableRenderGraphNode[] = [];
		nodes.forEach(node => {
			sortableNodes.push({
				id: node.id,
				dependencies: this.getDependencies(node, nodes),
				sharedResources: this.getSharedInputResources(node),
			});
		});

		const sorted = this.sortNodes(sortableNodes);

		return sorted.map(node => nodes.find(e => e.id === node.id)!);
	}

	/**
	 * Find all input resources of this node that can be outputs of other nodes.
	 * Return identifiers for the resources that are unique only in this sorting scope
	 */
	private getDependableInputResources(node: RenderGraphNode): string[] {
		return node.inputs.map(it => it.getDependencyId());
	}

	/**
	 * Find all output resources of this node that can be inputs of other nodes.
	 * Return identifiers for the resources that are unique only in this sorting scope
	 */
	private getDependableOutputResources(node: RenderGraphNode): string[] {
		return node.outputs.map(it => it.getDependencyId());
	}

	/**
	 * Find all resources this node requires and that can be shared with other nodes.
	 * return identifiers for the resources that are unique only in this sorting scope
	 */
	private getSharedInputResources(node: RenderGraphNode): string[] {
		return node.inputs.flatMap(it => it.getSharedResourceIds())
	}

	/**
	 * Find all nodes that depend on this current node.
	 * Return ids of the resulting nodes
	 */
	private getDependencies(current: RenderGraphNode, nodes: RenderGraphNode[]): string[] {
		const ids: string[] = [];

		const currentDependableOutputs = this.getDependableOutputResources(current);

		for (let i = 0; i < nodes.length; i++) {
			const other = nodes[i];
			if (other === current) continue;

			const otherDependableInputs = this.getDependableInputResources(other);
			if (this.hasOverlap(currentDependableOutputs, otherDependableInputs)) {
				ids.push(other.id);
			}
		}

		return ids;
	}

	/**
	 * whether the two given arrays contain any common values.
	 */
	private hasOverlap(valuesA: string[], valuesB: string[]): boolean {
		return valuesA.some(a => valuesB.indexOf(a) !== -1);
	}

	/**
	 * Bring the nodes into the required order
	 */
	private sortNodes(nodes: SortableRenderGraphNode[]): SortableRenderGraphNode[] {
		const topologicallySorted = this.topologicalSort(nodes);
		const sortedNodes: SortableRenderGraphNode[] = [];
		topologicallySorted.forEach(group => {
			sortedNodes.push(...this.resourceSort(group));
		});
		return sortedNodes;
	}

	/**
	 * Perform a simple topological order on the given nodes.
	 * Returns the ordered nodes. Nodes for which the order does not matter are grouped together in arrays.
	 */
	private topologicalSort(nodes: SortableRenderGraphNode[]): (SortableRenderGraphNode[])[] {
		const sorted: (SortableRenderGraphNode[])[] = [];
		let openNodes = [...nodes];

		// Return whether any node in the open set depends on the given node
		function anyOpenHasDependencyOn(node: SortableRenderGraphNode): boolean {
			return openNodes.some(open => open.dependencies.some(out => out === node.id));
		}

		// removes the given nodes from the open nodes
		function closeNodes(nodes: SortableRenderGraphNode[]) {
			const closedIds = nodes.map(e => e.id);
			openNodes = openNodes.filter(open => closedIds.indexOf(open.id) === -1);
		}

		while (openNodes.length > 0) {
			const candidates = openNodes.filter(open => !anyOpenHasDependencyOn(open));
			closeNodes(candidates);
			sorted.push(candidates);
		}

		return sorted;
	}

	/**
	 * Sort the given nodes by resources. Tries to cluster nodes using the same resources together
	 */
	private resourceSort(nodes: SortableRenderGraphNode[]): SortableRenderGraphNode[] {
		const uniqueResourcesMap = new Map<string, number>();
		nodes.forEach(node => {
			node.sharedResources.forEach(res => {
				if (!uniqueResourcesMap.has(res)) {
					uniqueResourcesMap.set(res, 0);
				}
				uniqueResourcesMap.set(res, uniqueResourcesMap.get(res)! + 1);
			});
		});

		const uniqueResources: ([string, number])[] = Array.from(uniqueResourcesMap.entries());
		uniqueResources.sort((a, b) => a[1] - b[1]);

		let nodesA: SortableRenderGraphNode[] = [...nodes];
		let nodesB: SortableRenderGraphNode[] = [];

		uniqueResources.forEach(uniqueResource => {
			const resourceId = uniqueResource[0];

			for (let i = 0; i < nodesA.length; i++) {
				const node = nodesA[i];
				if (node.sharedResources.indexOf(resourceId) !== -1) {
					nodesB.push(node);
				}
			}
			for (let i = 0; i < nodesA.length; i++) {
				const node = nodesA[i];
				if (node.sharedResources.indexOf(resourceId) === -1) {
					nodesB.push(node);
				}
			}

			nodesA = [...nodesB];
			nodesB = [];

		});

		return nodesA;
	}

}
