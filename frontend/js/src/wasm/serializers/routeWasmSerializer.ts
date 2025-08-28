import {Route} from "../../models/route/route";
import {TilemapUtils} from "../../common/tilemapUtils";
import {TileSummary} from "../../models/tile/tileSummary";

export namespace RouteWasmSerializer {

	const writer = new WasmDataViewWriter();

	export function serialize(routes: Route[], bytesPerEntry: number, targetBuffer: Uint8Array) {
		let index = 0;
		for (let i = 0, n = routes.length; i < n; i++) {
			const route = routes[i];
			for (let j = 0, m = route.path.length; j < m; j++) {
				const tile = route.path[j];
				serializeSingle(route, tile, index, i, bytesPerEntry, targetBuffer);
				index++;
			}
		}
	}

	function serializeSingle(route: Route, tile: TileSummary, indexEntry: number, indexRoute: number, bytesPerEntry: number, targetBuffer: Uint8Array) {
		const offset = indexEntry * bytesPerEntry;
		const view = new DataView(targetBuffer.buffer, targetBuffer.byteOffset + offset, bytesPerEntry);
		writer.setDataView(view);

		// route_id: i32,
		writer.pushInt32(indexRoute);

		// position_q: i32,
		// position_r: i32,
		writer.pushInt32(tile.position.q);
		writer.pushInt32(tile.position.r);

		// world_x: f32,
		// world_y: f32,
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.position.q, tile.position.r);
		writer.pushFloat32(tileCenter[0]);
		writer.pushFloat32(tileCenter[1]);
	}

}