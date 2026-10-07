import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import {gameGraphHtmlEntities} from "@pages/game/renderer/graph/html/html-entities.ts";
import {gameGraphHtmlTiles} from "@pages/game/renderer/graph/html/html-tiles.ts";


export function gameGraphHtml(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        dataCamera: DataRenderGraphNode<VersionedContainer<Camera>>
    },
) {

    const {htmlDrawEntities} = gameGraphHtmlEntities(g, dataProvider, inputs);
    const {htmlDrawTiles} = gameGraphHtmlTiles(g, dataProvider, inputs)

    return [
        htmlDrawEntities,
        htmlDrawTiles,
    ];
}
