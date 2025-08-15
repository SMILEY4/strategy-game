import * as wasm from "wasm";
import {Tile} from "../models/tile/tile";

export namespace WasmApi {

	interface TileWasm {
		position: TilePositionWasm;
	}

	interface TilePositionWasm {
		q: number,
		r: number,
	}

	export namespace Renderer {

		export function initTiles(tiles: Tile[]) {
			const wasmTiles: TileWasm[] = tiles.map(it => ({
				position: {
					q: it.position.q,
					r: it.position.r,
				},
			}));
			wasm.RendererApi.init_tiles(wasmTiles);
		}

		export function compute(): ArrayBuffer {
			return wasm.RendererApi.compute();
		}
	}

}