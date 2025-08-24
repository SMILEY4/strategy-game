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
import {TileResourceType} from "../models/tile/TileResourceType";
import {TextureAtlasEntry} from "../common/webgl/textureAtlas";
import {Settlement} from "../models/settlement/settlement";
import {TilemapUtils} from "../common/tilemapUtils";
import {Random} from "../common/random";
import {WorldObject} from "../models/worldobject/worldObject";
import {Color} from "../common/color";
import {Route} from "../models/route/route";

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

		export function setRoutes(routes: Route[]) {

			const amountRouteNodes = routes.flatMap(route => route.path).length;

			const reservedMemory: DirectRouteBuffer = wasmRenderApp!.reserve_route_memory(amountRouteNodes);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);

			const writer = new DataViewWriter();

			let index = 0;
			for (let i = 0, n = routes.length; i < n; i++) {
				const route = routes[i];

				for (let j = 0, m = route.path.length; j < m; j++) {
					const tile = route.path[j];

					const offset = index * reservedMemory.item_size;
					const view = new DataView(bytes.buffer, bytes.byteOffset + offset, reservedMemory.item_size);
					writer.setDataView(view);

					// route_id: i32,
					writer.pushInt32(i);

					// position_q: i32,
					// position_r: i32,
					writer.pushInt32(tile.position.q);
					writer.pushInt32(tile.position.r);

					// world_x: f32,
					// world_y: f32,
					const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.position.q, tile.position.r);
					writer.pushFloat32(tileCenter[0]);
					writer.pushFloat32(tileCenter[1]);

					index++;
				}
			}

			wasmRenderApp!.upload_direct_route_memory(reservedMemory.ptr, reservedMemory.len);
		}

		export function setWorldObjects(worldObjects: WorldObject[]) {

			const reservedMemory: DirectWorldObjectBuffer = wasmRenderApp!.reserve_world_object_memory(worldObjects.length);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);

			const writer = new DataViewWriter();

			for (let i = 0, n = worldObjects.length; i < n; i++) {
				const worldObject = worldObjects[i];
				const offset = i * reservedMemory.item_size;
				const view = new DataView(bytes.buffer, bytes.byteOffset + offset, reservedMemory.item_size);
				writer.setDataView(view);

				// position_q: i32,
				// position_r: i32,
				writer.pushInt32(worldObject.tile.position.q);
				writer.pushInt32(worldObject.tile.position.r);

				// world_x: f32,
				// world_y: f32,
				const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, worldObject.tile.position.q, worldObject.tile.position.r);
				writer.pushFloat32(tileCenter[0]);
				writer.pushFloat32(tileCenter[1]);

				// country_color_r: f32,
				// country_color_g: f32,
				// country_color_b: f32,
				const countryColor = Color.colorToRgbArray(worldObject.country.color);
				writer.pushFloat32(countryColor[0]);
				writer.pushFloat32(countryColor[1]);
				writer.pushFloat32(countryColor[2]);
			}

			wasmRenderApp!.upload_direct_world_object_memory(reservedMemory.ptr, reservedMemory.len);
		}

		export function setSettlements(settlements: Settlement[]) {

			const reservedMemory: DirectSettlementBuffer = wasmRenderApp!.reserve_settlement_memory(settlements.length);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);

			const writer = new DataViewWriter();

			for (let i = 0, n = settlements.length; i < n; i++) {
				const settlement = settlements[i];
				const offset = i * reservedMemory.item_size;
				const view = new DataView(bytes.buffer, bytes.byteOffset + offset, reservedMemory.item_size);
				writer.setDataView(view);

				// position_q: i32,
				// position_r: i32,
				writer.pushInt32(settlement.tile.position.q);
				writer.pushInt32(settlement.tile.position.r);

				// world_x: f32,
				// world_y: f32,
				const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settlement.tile.position.q, settlement.tile.position.r);
				writer.pushFloat32(tileCenter[0]);
				writer.pushFloat32(tileCenter[1]);

				// population_size: i32,
				writer.pushInt32(settlement.population.size.visible ? settlement.population.size.value.size : 1);

				// random_0: f32,
				// random_1: f32,
				// random_2: f32,
				writer.pushFloat32(Random.normalized(settlement.id + i));
				writer.pushFloat32(Random.normalized(settlement.id + i + "x"));
				writer.pushFloat32(Random.normalized(settlement.id + i + "y"));
			}

			wasmRenderApp!.upload_direct_settlement_memory(reservedMemory.ptr, reservedMemory.len);
		}

		export function setTiles(tiles: Tile[]) {

			const reservedMemory: DirectTileBuffer = wasmRenderApp!.reserve_tiles_memory(tiles.length);
			const bytes = new Uint8Array(memory.buffer, reservedMemory.ptr, reservedMemory.len * reservedMemory.item_size);

			const writer = new DataViewWriter();

			for (let i = 0, n = tiles.length; i < n; i++) {
				const tile = tiles[i];
				const offset = i * reservedMemory.item_size;
				const view = new DataView(bytes.buffer, bytes.byteOffset + offset, reservedMemory.item_size);
				writer.setDataView(view);

				// position_q: i32,
				// position_r: i32,
				writer.pushInt32(tile.position.q);
				writer.pushInt32(tile.position.r);

				// world_x: f32,
				// world_y: f32,
				writer.pushFloat32(tile.metaProperties.worldPosition.x);
				writer.pushFloat32(tile.metaProperties.worldPosition.y);

				// visibility: u8,
				writer.pushUint8(tile.visibility.renderId);

				// terrain_type: u8,
				writer.pushUint8(tile.base.visible ? tile.base.value.terrainType.renderId : 0);

				// owner_country_id: u8, // "0" = no owner
				writer.pushUint8((tile.political.visible && tile.political.value.controlledBy != null) ? 1 : 0);

				// owner_country_color_r: f32,
				// owner_country_color_g: f32,
				// owner_country_color_b: f32,
				if (tile.political.visible && tile.political.value.controlledBy != null) {
					writer.pushFloat32(tile.political.value.controlledBy.country.color.red / 255);
					writer.pushFloat32(tile.political.value.controlledBy.country.color.green / 255);
					writer.pushFloat32(tile.political.value.controlledBy.country.color.blue / 255);
				} else {
					writer.pushFloat32(0);
					writer.pushFloat32(0);
					writer.pushFloat32(0);
				}

				// owner_settlement_id: u8, // "0" = no owner
				writer.pushUint8((tile.political.visible && tile.political.value.controlledBy != null) ? 1 : 0);

				// owner_settlement_color_r: f32,
				// owner_settlement_color_g: f32,
				// owner_settlement_color_b: f32,
				if (tile.political.visible && tile.political.value.controlledBy != null) {
					writer.pushFloat32(tile.political.value.controlledBy.settlement.color.red / 255);
					writer.pushFloat32(tile.political.value.controlledBy.settlement.color.green / 255);
					writer.pushFloat32(tile.political.value.controlledBy.settlement.color.blue / 255);
				} else {
					writer.pushFloat32(0);
					writer.pushFloat32(0);
					writer.pushFloat32(0);
				}

				// is_valid_settlement_location: u8,
				writer.pushUint8(tile.isValidSettlementLocation ? 1 : 0);

				// resource_id: u8, // "0" = no resource
				writer.pushUint8((tile.base.visible && tile.base.value.resourceType != null && tile.base.value.resourceType != TileResourceType.NONE) ? 1 : 0);

				// resource_color_r: f32,
				// resource_color_g: f32,
				// resource_color_b: f32,
				// resource_color_a: f32,
				if (tile.base.visible && tile.base.value.resourceType != null && tile.base.value.resourceType != TileResourceType.NONE) {
					writer.pushFloat32(tile.base.value.resourceType.color!.red / 255);
					writer.pushFloat32(tile.base.value.resourceType.color!.green / 255);
					writer.pushFloat32(tile.base.value.resourceType.color!.blue / 255);
					writer.pushFloat32(1.0);
				} else {
					writer.pushFloat32(0);
					writer.pushFloat32(0);
					writer.pushFloat32(0);
					writer.pushFloat32(0);
				}


				// height: f32,
				writer.pushFloat32(tile.base.visible ? tile.base.value.height : 0);

				// random_0: f32,
				// random_1: f32,
				// random_2: f32,
				writer.pushFloat32(tile.metaProperties.randomValue0);
				writer.pushFloat32(tile.metaProperties.randomValue1);
				writer.pushFloat32(tile.metaProperties.randomValue2);
			}

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

		export function getVerticesDetails(): Uint8Array {
			return wasmRenderApp!.get_vertex_buffer_detail();
		}

		export function getVertexCountDetails(): number {
			return wasmRenderApp!.get_vertex_count_detail();
		}
	}

}

class DataViewWriter {

	dataView: DataView = null!;
	counter = 0;

	setDataView(dataView: DataView) {
		this.dataView = dataView;
		this.counter = 0;
	}

	pushUint8(value: number) {
		this.dataView.setUint8(this.counter, value);
		this.counter += 1;
	}

	pushInt32(value: number) {
		this.dataView.setInt32(this.counter, value, true);
		this.counter += 4;
	}

	pushFloat32(value: number) {
		this.dataView.setFloat32(this.counter, value, true);
		this.counter += 4;
	}

}