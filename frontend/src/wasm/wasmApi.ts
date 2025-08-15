import * as wasm from "wasm";
import {Tile} from "../models/tile/tile";
import {TileId} from "../models/tile/tileId";

export namespace WasmApi {

	interface TileWasm {
		id: string,
		position: {
			q: number,
			r: number,
		},
		world_position: {
			x: number,
			y: number,
		},
		visibility: number
		terrain_type: number,
		height: number,
		random_0: number,
		random_1: number,
	}

	export namespace Renderer {

		export function setTiles(tiles: Tile[]) {
			const wasmTiles: TileWasm[] = tiles.map(it => ({
				id: it.id,
				position: {
					q: it.position.q,
					r: it.position.r,
				},
				world_position: {
					x: it.metaProperties.worldPosition.x,
					y: it.metaProperties.worldPosition.y,
				},
				visibility: it.visibility.renderId,
				terrain_type: it.base.visible ? it.base.value.terrainType.renderId : 0,
				height: it.base.visible ? it.base.value.height : 0,
				random_0: it.metaProperties.randomValue0,
				random_1: it.metaProperties.randomValue1,
			}));
			wasm.RendererApi.init_tiles(wasmTiles);
		}

		export function update() {
			wasm.RendererApi.update();
		}

		export function getVerticesLand(): Uint8Array {
			return wasm.RendererApi.get_vertices_land();
		}

		export function getVerticesWater(): Uint8Array {
			return wasm.RendererApi.get_vertices_water();
		}

		export function getVerticesFog(): Uint8Array {
			return wasm.RendererApi.get_vertices_fog();
		}
	}

}