import {WasmRenderApp} from "wasm";
import {Tile} from "../models/tile/tile";

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

		let wasmRenderApp: WasmRenderApp | null = null;

		export function init() {
			wasmRenderApp = new WasmRenderApp();
		}

		export function dispose() {
			wasmRenderApp = null;
		}

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
			wasmRenderApp!.set_tiles(wasmTiles);
			wasmRenderApp!.update_borders();
		}

		export function updateTerrainTileVertices() {
			wasmRenderApp!.update_terrain_tile_vertices();
		}

		export function getVerticesLand(): Uint8Array {
			return wasmRenderApp!.get_vertex_buffer_land();
		}

		export function getVerticesWater(): Uint8Array {
			return wasmRenderApp!.get_vertex_buffer_water();
		}

		export function getVerticesFog(): Uint8Array {
			return wasmRenderApp!.get_vertex_buffer_fog();
		}
	}

}