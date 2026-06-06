import type {RenderGraphBuilder} from "@/modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@/modules/rendergraph/webgl/gl-program.ts";
import type {DataRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.data.ts";
import type {RenderChunk, RenderTile} from "@/renderer/data/models.ts";

export function gameGraphTileInstances(
    g: RenderGraphBuilder,
    nodes: {
        dataChunks: DataRenderGraphNode<RenderChunk[]>,
        dataTiles: DataRenderGraphNode<RenderTile[]>
    }
) {

    const tileInstanceTransformer = g.transformVertexOut({
        inputs: [nodes.dataChunks, nodes.dataTiles],
        outputs: {
            instances: {
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "chunkPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: (chunks: RenderChunk[], tiles: RenderTile[]) => {
            console.log("update tile instances", chunks.length)

            let tileCount = 0
            for (let i = 0, n=chunks.length; i < n; i++) {
                tileCount += chunks[i].tileIndices.length
            }

            const buffer = new ArrayBuffer(tileCount * (2 * GlAttributeType.FLOAT.bytes + 2 * GlAttributeType.FLOAT.bytes));
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            for (let i = 0, n=chunks.length; i < n; i++) {
               const chunk = chunks[i];
               for (let j = 0, m=chunk.tileIndices.length; j < m; j++) {
                   const tile = tiles[chunk.tileIndices[j]];
                   pushFloat32(tile.q)
                   pushFloat32(tile.r)
                   pushFloat32(chunk.centerQ)
                   pushFloat32(chunk.centerR)
               }
            }

            return {
                "instances": {
                    data: buffer,
                    count: tileCount,
                },
            };
        },
    });

    return {tileInstanceTransformer};

}