import {Projections} from "../../common/webgl/projections";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {Camera} from "../../common/webgl/camera";
import {buildMap, Rectangle} from "../../common/utils";
import {WasmApi} from "../../wasm/wasmApi";

export namespace RelevantWorldAreaDataGenerator {

	export const OUTPUT_ID = "relevant-area";

	const AREA_EXPANSION_PERCENTAGE = 0.1;
	const CHUNK_SIZE = 250; // in "world units" todo: maybe make dependent on zoom-> lookup table from "zoom range" to "chunk size" to keep divisible by e.g. 50

	export function func(context: RenderGraphNodeContext): Map<string, Rectangle> {
		const camera = context.get<Camera>("camera");
		const prevArea = context.get<Rectangle>("_this." + OUTPUT_ID);

		const visibleWorldMin = Projections.clipToWorld(camera, -1, -1);
		const visibleWorldMax = Projections.clipToWorld(camera, +1, +1);

		const visibleWorldWidth = visibleWorldMax.x - visibleWorldMin.x;
		const visibleWorldHeight = visibleWorldMax.y - visibleWorldMin.y;

		const area: Rectangle = {
			minX: floorTo(visibleWorldMin.x - visibleWorldWidth * AREA_EXPANSION_PERCENTAGE, CHUNK_SIZE),
			minY: floorTo(visibleWorldMin.y - visibleWorldHeight * AREA_EXPANSION_PERCENTAGE, CHUNK_SIZE),
			maxX: ceilTo(visibleWorldMax.x + visibleWorldWidth * AREA_EXPANSION_PERCENTAGE, CHUNK_SIZE),
			maxY: ceilTo(visibleWorldMax.y + visibleWorldHeight * AREA_EXPANSION_PERCENTAGE, CHUNK_SIZE),
		};


		if (areEqual(area, prevArea)) {
			return buildMap([]);
		} else {
			WasmApi.Renderer.setRelevantWorldArea(area);
			return buildMap([
				[OUTPUT_ID, area],
			]);
		}
	}

	function ceilTo(value: number, multiplesOf: number): number {
		return Math.ceil(value / multiplesOf) * multiplesOf;
	}

	function floorTo(value: number, multiplesOf: number): number {
		return Math.floor(value / multiplesOf) * multiplesOf;
	}

	function areEqual(a: Rectangle, b: Rectangle): boolean {
		if(!a || !b) {
			return false;
		}
		return a.minX === b.minX
			&& a.minY === b.minY
			&& a.maxX === b.maxX
			&& a.maxY === b.maxY;
	}

}