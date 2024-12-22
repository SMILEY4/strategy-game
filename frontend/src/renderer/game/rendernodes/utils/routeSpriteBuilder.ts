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
		return buildSpriteData(lineMesh, atlasEntry);
	}

	function buildWaypoints(route: Route): ([number, number])[] {
		const pointStep1: ([number, number])[] = [];
		for (let i = 0; i < route.path.length; i++) {
			const tile = route.path[i];
			pointStep1.push(TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r));
		}

		const pointStep2 = new CurveInterpolator(pointStep1, { tension: 0.2, alpha: 0.5}).getPoints(pointStep1.length * 3)

		const pointStep3: ([number, number])[] = [];
		for(let i=0; i<pointStep2.length; i++) {
			const p = pointStep2[i];
			pointStep3.push([
				p[0] + (Math.random() * 2 - 1) * 0.4,
				p[1] + (Math.random() * 2 - 1) * 0.4,
			])
		}

		return new CurveInterpolator(pointStep3, { tension: 0.2, alpha: 0.5}).getPoints(pointStep3.length * 3)
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

	function buildSpriteData(lineMesh: LineMesh, atlasEntry: TextureAtlasEntry): number[] {

		const vertexData: number[] = [];

		const triangles = lineMesh.triangles;
		const vertices = lineMesh.vertices;
		const uvBounds = getUVBounds(atlasEntry);

		for (let i = 0, n = triangles.length; i < n; i++) {
			const triangle = triangles[i];
			appendVertex(vertexData, vertices[triangle[0]], uvBounds);
			appendVertex(vertexData, vertices[triangle[1]], uvBounds);
			appendVertex(vertexData, vertices[triangle[2]], uvBounds);
		}

		return vertexData;
	}

	function appendVertex(outVertexData: number[], vertexData: number[], uvBounds: [number, number, number, number]) {

		// (x,y)
		outVertexData.push(vertexData[0]);
		outVertexData.push(vertexData[1]);

		// sprite y
		outVertexData.push(vertexData[1] + 10); // todo: temp +10 offset until other sprites' origins are correctly fixed

		// (u,v)
		const [minU, maxU, minV, maxV] = uvBounds;
		const u = vertexData[2] * (maxU - minU) + minU;
		const v = vertexData[3] * (maxV - minV) + minV;
		outVertexData.push(u);
		outVertexData.push(v);
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