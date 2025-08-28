import {
	DirectRouteBuffer,
	DirectSettlementBuffer,
	DirectTileBuffer,
	DirectWorldObjectBuffer,
	WasmRenderApp,
} from "wasm";

import {Tile} from "../models/tile/tile";
import {MapMode} from "../models/misc/mapMode";
import {TileSummary} from "../models/tile/tileSummary";
import {memory} from "wasm/wasm_bg.wasm";
import {TextureAtlasEntry} from "../common/webgl/textureAtlas";
import {Settlement} from "../models/settlement/settlement";
import {WorldObject} from "../models/worldobject/worldObject";
import {Route} from "../models/route/route";
import {Rectangle} from "../common/utils";
import {TileWasmSerializer} from "./serializers/tileWasmSerializer";
import {RouteWasmSerializer} from "./serializers/routeWasmSerializer";
import {WorldObjectWasmSerializer} from "./serializers/worldObjectWasmSerializer";
import {SettlementWasmSerializer} from "./serializers/settlementWasmSerializer";

export namespace WasmApi {

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

		export function setTextureAtlasEntries(entries: Map<string, TextureAtlasEntry[]>) {
			const wasmEntries = new Map<string, any>();
			for (let [key, group] of entries) {
				wasmEntries.set(key, group.map(it => ({
					name: it.name,
					vertices: it.vertices.flatMap(it => it),
					texture_coordinates: it.textureCoordinates.flatMap(it => it),
					offset: it.offset,
					scale: it.scale,
					mode: it.mode,
				})));
			}
			wasmRenderApp!.set_texture_atlas_entries(wasmEntries);
		}

		export function setMapMode(mapMode: MapMode) {
			let wasmMapMode: string = "default";
			if (mapMode === MapMode.DEFAULT) wasmMapMode = "default";
			if (mapMode === MapMode.COUNTRIES) wasmMapMode = "countries";
			if (mapMode === MapMode.SETTLEMENTS) wasmMapMode = "settlements";
			if (mapMode === MapMode.SETTLEMENT_LOCATIONS) wasmMapMode = "settlement_locations";
			if (mapMode === MapMode.RESOURCES) wasmMapMode = "resources";
			if (mapMode === MapMode.TERRAIN) wasmMapMode = "terrain";
			wasmRenderApp!.set_map_mode(wasmMapMode);
		}

		export function setMoveTargets(tiles: TileSummary[]) {
			const wasmTilePositions: TilePositionWasm[] = tiles.map(it => it.position);
			wasmRenderApp!.set_move_targets(wasmTilePositions);
		}

		export function setRelevantWorldArea(relevantArea: Rectangle) {
			if(relevantArea) {
				wasmRenderApp!.set_relevant_world_area(relevantArea.minX, relevantArea.minY, relevantArea.maxX, relevantArea.maxY);
			}
		}

		export function setRoutes(routes: Route[]) {
			const amountRouteNodes = routes.flatMap(route => route.path).length;
			const reservedMemory: DirectRouteBuffer = wasmRenderApp!.reserve_route_memory(amountRouteNodes);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);
			RouteWasmSerializer.serialize(routes, reservedMemory.item_size, bytes);
			wasmRenderApp!.upload_direct_route_memory(reservedMemory.ptr, reservedMemory.len);
		}

		export function setWorldObjects(worldObjects: WorldObject[]) {
			const reservedMemory: DirectWorldObjectBuffer = wasmRenderApp!.reserve_world_object_memory(worldObjects.length);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);
			WorldObjectWasmSerializer.serialize(worldObjects, reservedMemory.item_size, bytes);
			wasmRenderApp!.upload_direct_world_object_memory(reservedMemory.ptr, reservedMemory.len);
		}

		export function setSettlements(settlements: Settlement[]) {
			const reservedMemory: DirectSettlementBuffer = wasmRenderApp!.reserve_settlement_memory(settlements.length);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);
			SettlementWasmSerializer.serialize(settlements, reservedMemory.item_size, bytes);
			wasmRenderApp!.upload_direct_settlement_memory(reservedMemory.ptr, reservedMemory.len);
		}

		export function setTiles(tiles: Tile[]) {
			const reservedMemory: DirectTileBuffer = wasmRenderApp!.reserve_tiles_memory(tiles.length);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);
			TileWasmSerializer.serialize(tiles, reservedMemory.item_size, bytes);
			wasmRenderApp!.upload_direct_tile_memory(reservedMemory.ptr, reservedMemory.len);
			wasmRenderApp!.update_borders();
		}

		export function updateTerrainTileVertices() {
			wasmRenderApp!.update_terrain_tile_vertices();
		}

		export function updateOverlayTileVertices() {
			wasmRenderApp!.update_overlay_vertices();
		}

		export function updateDetailVertices() {
			wasmRenderApp!.update_detail_vertices();
		}

		export function getVerticesWater(): [Uint8Array, number] {
			return [
				wasmRenderApp!.get_vertex_buffer_water(),
				wasmRenderApp!.get_vertex_buffer_water_size()
			];
		}

		export function getVerticesLand(): [Uint8Array, number] {
			return [
				wasmRenderApp!.get_vertex_buffer_land(),
				wasmRenderApp!.get_vertex_buffer_land_size()
			];
		}

		export function getVerticesFog(): [Uint8Array, number] {
			return [
				wasmRenderApp!.get_vertex_buffer_fog(),
				wasmRenderApp!.get_vertex_buffer_fog_size()
			]
		}

		export function getVerticesOverlay(): [Uint8Array, number] {
			return [
				wasmRenderApp!.get_vertex_buffer_overlay(),
				wasmRenderApp!.get_vertex_buffer_overlay_size()
			]
		}

		export function getVerticesDetails(): [Uint8Array, number] {
			return [
				wasmRenderApp!.get_vertex_buffer_detail(),
				wasmRenderApp!.get_vertex_count_detail()
			]
		}

	}

}
