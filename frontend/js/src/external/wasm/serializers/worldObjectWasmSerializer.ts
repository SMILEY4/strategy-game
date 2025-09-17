import {WorldObject} from "../../../models/worldobject/worldObject";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {WasmDataViewWriter} from "./wasmDataViewWriter";

export namespace WorldObjectWasmSerializer {

	const writer = new WasmDataViewWriter();

	export function serialize(worldObjects: WorldObject[], bytesPerEntry: number, targetBuffer: Uint8Array) {
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			serializeSingle(worldObjects[i], i, bytesPerEntry, targetBuffer);
		}
	}

	function serializeSingle(worldObject: WorldObject, indexEntry: number, bytesPerEntry: number, targetBuffer: Uint8Array) {
		const offset = indexEntry * bytesPerEntry;
		const view = new DataView(targetBuffer.buffer, targetBuffer.byteOffset + offset, bytesPerEntry);
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

		// realm_color_r: u8,
		// realm_color_g: u8,
		// realm_color_b: u8,
		writer.pushUint8(worldObject.realm.color.getRedByte());
		writer.pushUint8(worldObject.realm.color.getGreenByte());
		writer.pushUint8(worldObject.realm.color.getBlueByte());
	}

}