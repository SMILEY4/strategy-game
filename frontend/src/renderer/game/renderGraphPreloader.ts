import {AbstractRenderNode} from "../common/graph/abstractRenderNode";
import {Preloader} from "../../common/preloader";
import {VertexFullQuadNode} from "../common/prebuilt/vertexFullquadNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {TilesWaterDrawNode} from "./rendernodes/tilesWaterDrawNode";
import {TilesLandDrawNode} from "./rendernodes/tilesLandDrawNode";
import {TilesFogDrawNode} from "./rendernodes/tilesFogDrawNode";
import {OverlayDrawNode} from "./rendernodes/overlayDrawNode";
import {CombineLayersDrawNode} from "./rendernodes/combineLayersDrawNode";
import {DrawRenderNode} from "../common/graph/drawRenderNode";
import {NodeInput} from "../common/graph/nodeInput";
import {TilesBaseVertexNode} from "./rendernodes/tilesBaseVertexNode";
import {OverlayBaseVertexNode} from "./rendernodes/overlayBaseVertexNode";

export namespace RenderGraphPreloader {

	export function tempLoad() {
		return preload([
			new VertexFullQuadNode(),
			new TilesVertexNode(),
			new TilesBaseVertexNode(),
			new OverlayVertexNode(),
			new OverlayBaseVertexNode(),
			new TilesWaterDrawNode(),
			new TilesLandDrawNode(),
			new TilesFogDrawNode(),
			new OverlayDrawNode(),
			new CombineLayersDrawNode(),
		]);
	}

	export function preload(nodes: AbstractRenderNode[]): Promise<void> {
		const textures = collectTextures(nodes);
		return Preloader.loadImages(textures);
	}

	function collectTextures(nodes: AbstractRenderNode[]): string[] {
		const textures: string[] = [];
		nodes.forEach(node => {
			if (node instanceof DrawRenderNode) {
				node.config.input.forEach(input => {
					if (input instanceof NodeInput.Texture) {
						textures.push(input.path);
					}
					if (input instanceof NodeInput.ConditionalTexture) {
						input.paths.forEach(it => textures.push(it.path))
					}
				});
			}
		});
		return textures;
	}

}