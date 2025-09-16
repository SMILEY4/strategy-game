import {WorldObject} from "../../models/worldobject/worldObject";
import {TilemapUtils} from "../../common/tilemapUtils";
import {Color} from "../../common/color";
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

		// country_color_r: f32,
		// country_color_g: f32,
		// country_color_b: f32,
		const realmColor = Color.colorToRgbArray(worldObject.realm.color);
		writer.pushFloat32(realmColor[0]);
		writer.pushFloat32(realmColor[1]);
		writer.pushFloat32(realmColor[2]);
	}

}