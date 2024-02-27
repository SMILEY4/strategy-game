import {RenderGraphSorter} from "../graph/renderGraphSorter";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../graph/drawRenderNode";
import {VertexRenderNode} from "../graph/vertexRenderNode";

interface WebglSortableNodeNode {
    id: string,
    dependsOn: string[],
    sharedResources: string[],
}

export class WebGLRenderGraphSorter implements RenderGraphSorter {

    /**
     * Bring the nodes in an order so that
     * - dependencies defined by render-targets are resolved (guaranteed)
     * - nodes using the same resources are clustered together
     */
    public sort(nodes: AbstractRenderNode[]): AbstractRenderNode[] {
        const sortableNodes = this.buildNodes(nodes);
        const sorted = this.sortNodes(sortableNodes);
        return sorted.map(node => nodes.find(e => e.id === node.id)!);
    }

    /**
     * Build a simplified representation of the render nodes
     */
    private buildNodes(renderNodes: AbstractRenderNode[]): WebglSortableNodeNode[] {
        let nodes: WebglSortableNodeNode[] = [];
        renderNodes.forEach(renderNode => {
            nodes.push({
                id: renderNode.id,
                dependsOn: this.findOutgoing(renderNode, renderNodes),
                sharedResources: this.findSharedResources(renderNode),
            });
        });
        return nodes;
    }

    /**
     * Return the ids of nodes on which the given node depends on (e.g. via render-target)
     */
    private findOutgoing(renderNode: AbstractRenderNode, renderNodes: AbstractRenderNode[]): string[] {
        const outgoing: string[] = [];

        // render-target dependencies
        const outputRenderTargets = this.getOutputRenderTargetIds(renderNode);
        renderNodes.forEach(other => {
            const inputRenderTargets = this.getInputRenderTargetIds(other);
            if (outputRenderTargets.some(e => inputRenderTargets.indexOf(e) !== -1)) {
                outgoing.push(other.id);
            }
        });

        // vertex-data dependencies
        const outputVertexData = this.getOutputVertexData(renderNode);
        renderNodes.forEach(other => {
            const inputVertexData = this.getInputVertexData(other);
            if (outputVertexData.some(e => inputVertexData.indexOf(e) !== -1)) {
                outgoing.push(other.id);
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
     * Return the ids of render-targets the given node requires (has as input)
     */
    private getInputRenderTargetIds(renderNode: AbstractRenderNode): string[] {
        if (renderNode instanceof DrawRenderNode) {
            return renderNode.config.input
                .filter(e => e instanceof DrawRenderNodeInput.RenderTarget)
                .map(e => (e as DrawRenderNodeInput.RenderTarget).renderTargetId);
        } else {
            return [];
        }
    }

    /**
     * Return the ids of render-targets the given nodes produces (has as output)
     */
    private getOutputRenderTargetIds(renderNode: AbstractRenderNode): string[] {
        if (renderNode instanceof DrawRenderNode) {
            return renderNode.config.output
                .filter(e => e instanceof DrawRenderNodeOutput.RenderTarget)
                .map(e => (e as DrawRenderNodeOutput.RenderTarget).renderTargetId);
        } else {
            return [];
        }
    }

    /**
     * Returns the ids of all input vertex data of the given node
     */
    private getInputVertexData(renderNode: AbstractRenderNode): string[] {
        if (renderNode instanceof DrawRenderNode) {
            return renderNode.config.input
                .filter(e => e instanceof DrawRenderNodeInput.VertexData)
                .map(e => (e as DrawRenderNodeInput.VertexData).vertexDataId);
        } else {
            return [];
        }
    }

    /**
     * Returns the ids of all output vertex data of the given node
     */
    private getOutputVertexData(renderNode: AbstractRenderNode): string[] {
        if (renderNode instanceof VertexRenderNode) {
            return renderNode.config.outputData
                .map(e => e.id);
        } else {
            return [];
        }
    }

    /**
     * Returns the ids of all input textures and render-targets of the given node
     */
    private getInputTextures(renderNode: AbstractRenderNode): string[] {
        if (renderNode instanceof DrawRenderNode) {
            return [
                ...renderNode.config.input
                    .filter(e => e instanceof DrawRenderNodeInput.RenderTarget)
                    .map(e => "rendertarget:" + (e as DrawRenderNodeInput.RenderTarget).renderTargetId),
                ...renderNode.config.input
                    .filter(e => e instanceof DrawRenderNodeInput.Texture)
                    .map(e => "texture:" + (e as DrawRenderNodeInput.Texture).path),
            ];
        } else {
            return [];
        }
    }

    /**
     * Bring the nodes into the required order
     */
    private sortNodes(nodes: WebglSortableNodeNode[]): WebglSortableNodeNode[] {
        const topologicallySorted = this.topologicalSort(nodes);
        const sortedNodes: WebglSortableNodeNode[] = [];
        topologicallySorted.forEach(group => {
            sortedNodes.push(...this.resourceSort(group));
        });
        return sortedNodes;
    }

    /**
     * Perform a simple topological order on the given nodes.
     * Returns the ordered nodes. Nodes for which the order does not matter are grouped together in arrays.
     */
    private topologicalSort(nodes: WebglSortableNodeNode[]): (WebglSortableNodeNode[])[] {
        const sorted: (WebglSortableNodeNode[])[] = [];
        let openNodes = [...nodes];

        // Return whether any node in the open set depends on the given node
        function anyOpenHasDependencyOn(node: WebglSortableNodeNode): boolean {
            return openNodes.some(open => open.dependsOn.some(out => out === node.id));
        }

        // removes the given nodes from the open nodes
        function closeNodes(nodes: WebglSortableNodeNode[]) {
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
    private resourceSort(nodes: WebglSortableNodeNode[]): WebglSortableNodeNode[] {
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

        let nodesA: WebglSortableNodeNode[] = [...nodes];
        let nodesB: WebglSortableNodeNode[] = [];

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