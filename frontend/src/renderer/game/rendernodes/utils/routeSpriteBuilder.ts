import {Route} from "../../../../models/base/route";
import {LineMesh} from "../../../../common/webgl/lines/lineMesh";
import {LineMeshCreator} from "../../../../common/webgl/lines/lineMeshCreator";
import {LineCapsButt} from "../../../../common/webgl/lines/lineCapsButt";
import {LineJoinMiter} from "../../../../common/webgl/lines/lineJoinMitter";
import {TextureAtlasEntry} from "../../../../common/webgl/textureAtlas";
import {TilemapUtils} from "../../../../common/tilemapUtils";
import {CurveInterpolator} from "curve-interpolator";

export namespace RouteSpriteBuilder {

	const lineMeshCreator = new LineMeshCreator();

	/**
	 * @returns the raw vertex data for a SpriteBuffer for the given route
	 */
	export function build(route: Route, atlasEntry: TextureAtlasEntry): number[] {
		const waypoints = buildWaypoints(route);
		const lineMesh = buildLineMesh(waypoints);
		return buildSpriteData(lineMesh, atlasEntry, route.path.length);
	}

	function buildWaypoints(route: Route): ([number, number])[] {
		const pointStep1: ([number, number])[] = [];
		for (let i = 0; i < route.path.length; i++) {
			const tile = route.path[i];
			pointStep1.push(TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r));
		}

		const pointStep2 = new CurveInterpolator(pointStep1, {
			tension: 0.2,
			alpha: 0.5,
		}).getPoints(pointStep1.length * 3);

		const pointStep3: ([number, number])[] = [];
		for (let i = 0; i < pointStep2.length; i++) {
			const p = pointStep2[i];
			pointStep3.push([
				p[0] + (Math.random() * 2 - 1) * 0.4,
				p[1] + (Math.random() * 2 - 1) * 0.4,
			]);
		}

		return new CurveInterpolator(pointStep3, {tension: 0.2, alpha: 0.5}).getPoints(pointStep3.length * 3);
	}

	function buildLineMesh(waypoints: ([number, number])[]): LineMesh {
		return lineMeshCreator.create({
			points: waypoints,
			thickness: 1,
			capStartFunction: LineCapsButt.start,
			capEndFunction: LineCapsButt.end,
			joinFunction: LineJoinMiter.join,
			vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => vertexData,
		});
	}

	function buildSpriteData(lineMesh: LineMesh, atlasEntry: TextureAtlasEntry, numTiles: number): number[] {

		const vertexData: number[] = [];

		const triangles = lineMesh.triangles;
		const vertices = lineMesh.vertices;
		const uvBounds = getUVBounds(atlasEntry);
		console.log("=========0")

		for (let i = 0, n = triangles.length; i < n; i++) {
			const triangle = triangles[i];
			appendVertex(vertexData, vertices[triangle[0]], uvBounds, numTiles);
			appendVertex(vertexData, vertices[triangle[1]], uvBounds, numTiles);
			appendVertex(vertexData, vertices[triangle[2]], uvBounds, numTiles);
		}


		return vertexData;
	}

	function appendVertex(outVertexData: number[], vertexData: number[], uvBounds: [number, number, number, number], numTiles: number) {

		// (x,y)
		outVertexData.push(vertexData[0]);
		outVertexData.push(vertexData[1]);

		// sprite y
		outVertexData.push(vertexData[1] + 10); // todo: temp +10 offset until other sprites' origins are correctly fixed

		// (u,v)
		const u = (triangleFunction(vertexData[2], (numTiles - 1) / 2) + 1) / 2 // remap from "start = 0 -> 1 = end" to oscillate along path, i.e. "start = 0 -> 1 -> 0 -> 1 = end"
		const v = vertexData[3];

		const [minU, maxU, minV, maxV] = uvBounds;
		const ur = u * (maxU - minU) + minU;
		const vr = v * (maxV - minV) + minV;

		outVertexData.push(ur);
		outVertexData.push(vr);
	}

	function triangleFunction(x: number, f: number): number{
		// source: https://www.desmos.com/calculator/ivdvmfo7or
		return ((x * f) % 1) < 0.5
			? ((x*f) % 1) * 4 - 1
			: 3 + ((x*f) % 1) * -4;
	}

	function getUVBounds(atlasEntry: TextureAtlasEntry): [number, number, number, number] {
		let minU = +99999999;
		let maxU = -99999999;
		let minV = +99999999;
		let maxV = -99999999;

		for (let i = 0, n = atlasEntry.textureCoordinates.length; i < n; i++) {
			const textureCoords = atlasEntry.textureCoordinates[i];
			minU = Math.min(minU, textureCoords[0]);
			maxU = Math.max(maxU, textureCoords[0]);
			minV = Math.min(minV, textureCoords[1]);
			maxV = Math.max(maxV, textureCoords[1]);
		}

		return [minU, maxU, minV, maxV];
	}

}