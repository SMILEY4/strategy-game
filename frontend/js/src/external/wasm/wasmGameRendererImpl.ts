import {WasmGameRenderer} from "../../renderer/wasmGameRenderer";
import {MapMode} from "../../models/misc/mapMode";
import {TileSummary} from "../../models/tile/tileSummary";
import {Rectangle} from "../../common/utils";
import {TextureAtlasEntry} from "../../common/webgl/textureAtlas";
import {Tile} from "../../models/tile/tile";
import {WorldObject} from "../../models/worldobject/worldObject";
import {DirectTileBuffer, DirectWorldObjectBuffer, WasmRenderApp} from "../../../../wasm/pkg";
import {memory} from "../../../../wasm/pkg/wasm_bg.wasm";
import {WorldObjectWasmSerializer} from "./serializers/worldObjectWasmSerializer";
import {TileWasmSerializer} from "./serializers/tileWasmSerializer";

export class WasmGameRendererImpl implements WasmGameRenderer {

	private wasmRenderApp: WasmRenderApp = null!!;

	init(): void {
		this.wasmRenderApp = new WasmRenderApp();
	}

	dispose(): void {
		this.wasmRenderApp = null!!;
	}


	setTextureAtlasEntries(entries: Map<string, TextureAtlasEntry[]>): void {
		const wasmEntries = new Map<string, any>();
		for (let [key, group] of entries) {
			wasmEntries.set(key, group.map(it => ({
				vertices: it.vertices.flatMap(it => it),
				texture_coordinates: it.textureCoordinates.flatMap(it => it),
				offset: it.offset,
				scale: it.scale,
				mode: it.mode,
			})));
		}
		this.wasmRenderApp.set_texture_atlas_entries(wasmEntries);
	}

	setMapMode(mapMode: MapMode): void {
		let wasmMapMode: string = "default";
		if (mapMode === MapMode.DEFAULT) wasmMapMode = "default";
		if (mapMode === MapMode.COUNTRIES) wasmMapMode = "countries";
		if (mapMode === MapMode.SETTLEMENTS) wasmMapMode = "settlements";
		if (mapMode === MapMode.SETTLEMENT_LOCATIONS) wasmMapMode = "settlement_locations";
		if (mapMode === MapMode.RESOURCES) wasmMapMode = "resources";
		if (mapMode === MapMode.TERRAIN) wasmMapMode = "terrain";
		this.wasmRenderApp.set_map_mode(wasmMapMode);
	}

	setMoveTargets(tiles: TileSummary[]): void {
		const wasmTilePositions: TilePositionWasm[] = tiles.map(it => it.position);
		this.wasmRenderApp.set_move_targets(wasmTilePositions);
	}

	setRelevantWorldArea(relevantArea: Rectangle): void {
		if (relevantArea) {
			this.wasmRenderApp.set_relevant_world_area(relevantArea.minX, relevantArea.minY, relevantArea.maxX, relevantArea.maxY);
		}
	}

	setWorldObjects(worldObjects: WorldObject[]): void {
		const reservedMemory: DirectWorldObjectBuffer = this.wasmRenderApp.reserve_world_object_memory(worldObjects.length);
		const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);
		WorldObjectWasmSerializer.serialize(worldObjects, reservedMemory.item_size, bytes);
		this.wasmRenderApp.upload_direct_world_object_memory(reservedMemory.ptr, reservedMemory.len);
	}

	setTiles(tiles: Tile[]): void {
		const reservedMemory: DirectTileBuffer = this.wasmRenderApp.reserve_tiles_memory(tiles.length);
		const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);
		TileWasmSerializer.serialize(tiles, reservedMemory.item_size, bytes);
		this.wasmRenderApp.upload_direct_tile_memory(reservedMemory.ptr, reservedMemory.len);
		this.wasmRenderApp.update_borders();
	}

	updateTerrainTileVertices(): void {
		this.wasmRenderApp.update_terrain_tile_vertices();
	}

	updateOverlayTileVertices(): void {
		this.wasmRenderApp.update_overlay_vertices();
	}

	updateDetailVertices(): void {
		this.wasmRenderApp.update_detail_vertices();
	}

	getVerticesWater(): [Uint8Array, number] {
		return [
			this.wasmRenderApp.get_vertex_buffer_water(),
			this.wasmRenderApp.get_vertex_buffer_water_size(),
		];
	}

	getVerticesLand(): [Uint8Array, number] {
		return [
			this.wasmRenderApp.get_vertex_buffer_land(),
			this.wasmRenderApp.get_vertex_buffer_land_size(),
		];
	}

	getVerticesFog(): [Uint8Array, number] {
		return [
			this.wasmRenderApp.get_vertex_buffer_fog(),
			this.wasmRenderApp.get_vertex_buffer_fog_size(),
		];
	}

	getVerticesOverlay(): [Uint8Array, number] {
		return [
			this.wasmRenderApp.get_vertex_buffer_overlay(),
			this.wasmRenderApp.get_vertex_buffer_overlay_size(),
		];
	}

	getVerticesDetails(): [Uint8Array, number] {
		return [
			this.wasmRenderApp.get_vertex_buffer_detail(),
			this.wasmRenderApp.get_vertex_count_detail(),
		];
	}


}