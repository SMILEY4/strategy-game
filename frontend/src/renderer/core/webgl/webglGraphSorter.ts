import {AbstractRenderNode} from "../nodes/abstractRenderNode";
import {RenderTargetInputConfig, RenderTargetOutputConfig} from "../resources/renderTargetRenderResource";
import {TextureInputConfig} from "../resources/textureRenderResource";

export interface WebglSortableRenderNode {
    id: string,
    dependsOn: string[],
    sharedResources: string[],
}

export class WebglGraphSorter {

    /**
     * Bring the nodes in an order so that
     * - dependencies defined by render-targets are resolved (guaranteed)
     * - nodes using the same resources are clustered together
     */
    public sort(renderNodes: AbstractRenderNode[]): AbstractRenderNode[] {
        const nodes = this.buildNodes(renderNodes);
        const sorted = this.sortNodes(nodes);
        return sorted.map(node => renderNodes.find(n => n.getId() === node.id)!);
    }

    /**
     * Build a simplified representation of the render nodes
     */
    private buildNodes(renderNodes: AbstractRenderNode[]): WebglSortableRenderNode[] {
        let nodes: WebglSortableRenderNode[] = [];
        renderNodes.forEach(renderNode => {
            nodes.push({
                id: renderNode.getId(),
                dependsOn: this.findOutgoing(renderNode, renderNodes),
                sharedResources: this.findSharedResources(renderNode),
            });
        });
        return nodes;
    }

    /**
     * Bring the nodes into the required order
     */
    private sortNodes(nodes: WebglSortableRenderNode[]): WebglSortableRenderNode[] {
        const topologicallySorted = this.topologicalSort(nodes);
        const sortedNodes: WebglSortableRenderNode[] = [];
        topologicallySorted.forEach(group => {
            sortedNodes.push(...this.resourceSort(group));
        });
        return sortedNodes;
    }

    /**
     * Perform a simple topological order on the given nodes.
     * Returns the ordered nodes. Nodes for which the order does not matter are grouped together in arrays.
     */
    private topologicalSort(nodes: WebglSortableRenderNode[]): (WebglSortableRenderNode[])[] {
        const sorted: (WebglSortableRenderNode[])[] = [];
        let openNodes = [...nodes];

        // Return whether any node in the open set depends on the given node
        function anyOpenHasDependencyOn(node: WebglSortableRenderNode): boolean {
            return openNodes.some(open => open.dependsOn.some(out => out === node.id));
        }

        // removes the given nodes from the open nodes
        function closeNodes(nodes: WebglSortableRenderNode[]) {
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
    private resourceSort(nodes: WebglSortableRenderNode[]): WebglSortableRenderNode[] {
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

        let nodesA: WebglSortableRenderNode[] = [...nodes];
        let nodesB: WebglSortableRenderNode[] = [];

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

    /**
     * Return the ids of nodes on which the given node depends on (e.g. via render-target)
     */
    private findOutgoing(renderNode: AbstractRenderNode, renderNodes: AbstractRenderNode[]): string[] {
        const outgoing: string[] = [];

        // render-target dependencies
        const outputRenderTargets = this.getOutputRenderTargetNames(renderNode);
        renderNodes.forEach(other => {
            const inputRenderTargets = this.getInputRenderTargetNames(other);
            if (outputRenderTargets.some(rt => inputRenderTargets.indexOf(rt) !== -1)) {
                outgoing.push(other.getId());
            }
        });

        // manual dependencies
        // ...

        return outgoing;
    }

    /**
     * Return ids of resources this node requires and can be shared with other nodes (e.g. textures)
     */
    private findSharedResources(renderNode: AbstractRenderNode): string[] {
        const sharedResources: string[] = [];
        sharedResources.push(...this.getInputTextures(renderNode));
        return sharedResources;
    }

    /**
     * Return the names of render-targets the given node requires (has as input)
     */
    private getInputRenderTargetNames(renderNode: AbstractRenderNode): string[] {
        return renderNode.getConfig().inputs
            .filter(e => e.type === "render-target")
            .map(e => (e as RenderTargetInputConfig).name);
    }

    /**
     * Return the names of render-targets the given nodes produces (has as output)
     */
    private getOutputRenderTargetNames(renderNode: AbstractRenderNode): string[] {
        return renderNode.getConfig().outputs
            .filter(e => e.type === "render-target")
            .map(e => (e as RenderTargetOutputConfig).name);
    }

    /**
     * Returns the names of all input textures and render-targets of the given node
     */
    private getInputTextures(renderNode: AbstractRenderNode): string[] {
        return [
            ...renderNode.getConfig().inputs
                .filter(e => e.type === "texture")
                .map(e => "tx:" + (e as TextureInputConfig).path),
            ...renderNode.getConfig().inputs
                .filter(e => e.type === "render-target")
                .map(e => "rt:" + (e as RenderTargetInputConfig).name),
        ];
    }

}

