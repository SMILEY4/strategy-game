import {TilemapUtils} from "../../common/tilemapUtils";
import {Random} from "../../common/random";
import {Settlement} from "../../models/settlement/settlement";
import {WasmDataViewWriter} from "./wasmDataViewWriter";

export namespace SettlementWasmSerializer {

	const writer = new WasmDataViewWriter();

	export function serialize(settlements: Settlement[], bytesPerEntry: number, targetBuffer: Uint8Array) {
		for (let i = 0, n = settlements.length; i < n; i++) {
			serializeSingle(settlements[i], i, bytesPerEntry, targetBuffer);
		}
	}

	function serializeSingle(settlement: Settlement, indexEntry: number, bytesPerEntry: number, targetBuffer: Uint8Array) {
		const offset = indexEntry * bytesPerEntry;
		const view = new DataView(targetBuffer.buffer, targetBuffer.byteOffset + offset, bytesPerEntry);
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
		writer.pushFloat32(Random.normalized(settlement.id + indexEntry));
		writer.pushFloat32(Random.normalized(settlement.id + indexEntry + "x"));
		writer.pushFloat32(Random.normalized(settlement.id + indexEntry + "y"));
	}

}