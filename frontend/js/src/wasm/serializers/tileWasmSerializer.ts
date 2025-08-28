import {Tile} from "../../models/tile/tile";
import {TileResourceType} from "../../models/tile/TileResourceType";
import {WasmDataViewWriter} from "./wasmDataViewWriter";

export namespace TileWasmSerializer {

	const writer: WasmDataViewWriter = new WasmDataViewWriter();

	export function serialize(tiles: Tile[], bytesPerEntry: number, targetBuffer: Uint8Array) {
		for (let i = 0, n = tiles.length; i < n; i++) {
			serializeSingle(tiles[i], i, bytesPerEntry, targetBuffer);
		}
	}

	function serializeSingle(tile: Tile, indexEntry: number, bytesPerEntry: number, targetBuffer: Uint8Array) {
		const offset = indexEntry * bytesPerEntry;
		const view = new DataView(targetBuffer.buffer, targetBuffer.byteOffset + offset, bytesPerEntry);
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
		writer.pushUint8((tile.political.visible && tile.political.value.controlledBy != null) ? 1 : 0); // todo: proper id

		// owner_country_color_r: u8,
		// owner_country_color_g: u8,
		// owner_country_color_b: u8,
		if (tile.political.visible && tile.political.value.controlledBy != null) {
			writer.pushUint8(tile.political.value.controlledBy.country.color.red);
			writer.pushUint8(tile.political.value.controlledBy.country.color.green);
			writer.pushUint8(tile.political.value.controlledBy.country.color.blue);
		} else {
			writer.pushUint8(0);
			writer.pushUint8(0);
			writer.pushUint8(0);
		}

		// owner_settlement_id: u8, // "0" = no owner
		writer.pushUint8((tile.political.visible && tile.political.value.controlledBy != null) ? 1 : 0); // todo: proper id

		// owner_settlement_color_r: u8,
		// owner_settlement_color_g: u8,
		// owner_settlement_color_b: u8,
		if (tile.political.visible && tile.political.value.controlledBy != null) {
			writer.pushUint8(tile.political.value.controlledBy.settlement.color.red);
			writer.pushUint8(tile.political.value.controlledBy.settlement.color.green);
			writer.pushUint8(tile.political.value.controlledBy.settlement.color.blue);
		} else {
			writer.pushUint8(0);
			writer.pushUint8(0);
			writer.pushUint8(0);
		}

		// is_valid_settlement_location: u8,
		writer.pushUint8(tile.isValidSettlementLocation ? 1 : 0);

		// resource_id: u8, // "0" = no resource
		writer.pushUint8((tile.base.visible && tile.base.value.resourceType != null && tile.base.value.resourceType != TileResourceType.NONE) ? 1 : 0);

		// resource_color_r: u8,
		// resource_color_g: u8,
		// resource_color_b: u8,
		// resource_color_a: u8,
		if (tile.base.visible && tile.base.value.resourceType != null && tile.base.value.resourceType != TileResourceType.NONE) {
			writer.pushUint8(tile.base.value.resourceType.color!.red);
			writer.pushUint8(tile.base.value.resourceType.color!.green);
			writer.pushUint8(tile.base.value.resourceType.color!.blue);
			writer.pushUint8(1);
		} else {
			writer.pushUint8(0);
			writer.pushUint8(0);
			writer.pushUint8(0);
			writer.pushUint8(0);
		}

		// height: f32,
		writer.pushFloat32(tile.base.visible ? tile.base.value.height : 0);

		// rng_seed: u64,
		writer.pushUint32(tile.metaProperties.randomValue1 * 1000000);
	}

}