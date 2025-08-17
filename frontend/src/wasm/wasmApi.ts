import {WasmRenderApp} from "wasm";
import {Tile} from "../models/tile/tile";
import {Color} from "../common/color";
import {MapMode} from "../models/misc/mapMode";
import {TileSummary} from "../models/tile/tileSummary";

export namespace WasmApi {

	interface TileWasm {
		position: TilePositionWasm,
		world_position: {
			x: number,
			y: number,
		},
		visibility: number
		terrain_type: number,
		owner_country_id: string | null,
		owner_country_color: [number, number, number] | null,
		owner_settlement_id: string | null,
		owner_settlement_color: [number, number, number] | null,
		is_valid_settlement_location: boolean,
		resource_color: [number, number, number, number] | null,
		height: number,
		random_0: number,
		random_1: number,
	}

	interface TilePositionWasm {
		q: number,
		r: number,
	}

	export namespace Renderer {

		let wasmRenderApp: WasmRenderApp | null = null;

		export function init() {
			wasmRenderApp = new WasmRenderApp();
		}

		export function dispose() {
			wasmRenderApp = null;
		}

		export function setMapMode(mapMode: MapMode) {
			let wasmMapMode: string = "default"
			if(mapMode === MapMode.DEFAULT) wasmMapMode = "default"
			if(mapMode === MapMode.COUNTRIES) wasmMapMode = "countries"
			if(mapMode === MapMode.SETTLEMENTS) wasmMapMode = "settlements"
			if(mapMode === MapMode.SETTLEMENT_LOCATIONS) wasmMapMode = "settlement_locations"
			if(mapMode === MapMode.RESOURCES) wasmMapMode = "resources"
			if(mapMode === MapMode.TERRAIN) wasmMapMode = "terrain"
			wasmRenderApp!.set_map_mode(wasmMapMode)
		}

		export function setMoveTargets(tiles: TileSummary[]) {
			const wasmTilePositions: TilePositionWasm[] = tiles.map(it => it.position);
			wasmRenderApp!.set_move_targets(wasmTilePositions)
		}

		export function setTiles(tiles: Tile[]) {
			const wasmTiles: TileWasm[] = tiles.map(tile => ({
				position: {
					q: tile.position.q,
					r: tile.position.r,
				},
				world_position: {
					x: tile.metaProperties.worldPosition.x,
					y: tile.metaProperties.worldPosition.y,
				},
				visibility: tile.visibility.renderId,
				terrain_type: tile.base.visible ? tile.base.value.terrainType.renderId : 0,
				owner_country_id: tile.political.visible && tile.political.value.controlledBy != null
					? tile.political.value.controlledBy.country.id
					: null,
				owner_country_color: tile.political.visible && tile.political.value.controlledBy != null
					? Color.colorToRgbArray(tile.political.value.controlledBy.country.color)
					: null,
				owner_settlement_id: tile.political.visible && tile.political.value.controlledBy != null
					? tile.political.value.controlledBy.settlement.id
					: null,
				owner_settlement_color: tile.political.visible && tile.political.value.controlledBy != null
					? Color.colorToRgbArray(tile.political.value.controlledBy.settlement.color)
					: null,
				is_valid_settlement_location: tile.isValidSettlementLocation,
				resource_color: tile.base.visible && tile.base.value?.resourceType.color != null
					? Color.colorToRgbaArray(tile.base.value?.resourceType.color!, 1.0)
					: null,
				height: tile.base.visible ? tile.base.value.height : 0,
				random_0: tile.metaProperties.randomValue0,
				random_1: tile.metaProperties.randomValue1,
			}));
			wasmRenderApp!.set_tiles(wasmTiles);
			wasmRenderApp!.update_borders();
		}

		export function updateTerrainTileVertices() {
			wasmRenderApp!.update_terrain_tile_vertices();
		}

		export function updateOverlayTileVertices() {
			wasmRenderApp!.update_overlay_vertices();
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

		export function getVerticesOverlay(): Uint8Array {
			return wasmRenderApp!.get_vertex_buffer_overlay();
		}
	}

}