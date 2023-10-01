// noinspection PointlessArithmeticExpressionJS

import {Tile} from "../../../models/tile";
import {GLBuffer, GLBufferType, GLBufferUsage} from "../common/glBuffer";
import {TilemapUtils} from "../../../core/tilemap/tilemapUtils";
import {RenderChunk} from "./renderChunk";
import {BufferPackager} from "../common/bufferPackager";

/*
Vertices of hex-tiles are constructed as following:
0: center
1. top-right
2. bottom-right
3. bottom
4. bottom-left
5. top-left
6. top
 */

export namespace RenderChunkFactory {

    const valuesPerVertex = 2 + 4 + 2 + 2;
    const verticesPerTile = 13;
    const chunkSize = 11;

    interface IntermediateChunk {
        key: string,
        cq: number,
        cr: number,
        vertices: number[]
        indices: number[]
        indexOffset: number
    }

    export function createChunks(gl: WebGL2RenderingContext, tiles: Tile[]): RenderChunk[] {
        const chunks = new Map<string, IntermediateChunk>();
        tiles.forEach(tile => {
            const chunk = getChunk(tile, chunks);
            const tileVertices = buildTileVertices(tile, chunk.cq, chunk.cr);
            const tileIndices = indexData(chunk.indexOffset);
            chunk.vertices.push(...tileVertices);
            chunk.indices.push(...tileIndices);
            chunk.indexOffset = chunk.indexOffset + verticesPerTile;
            chunks.set(chunk.key, chunk);
        });
        return Array.from(chunks.values()).map(chunk => new RenderChunk(
            chunk.cq,
            chunk.cr,
            GLBuffer.createRaw(gl, GLBufferType.ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, BufferPackager.pack(chunk.vertices, [
                {type: "float"},
                {type: "float"},
                {type: "float"},
                {type: "float"},
                {type: "float"},
                {type: "float"},
                {type: "float"},
                {type: "float"},
                {type: "int"},
                {type: "int"}
            ]), chunk.vertices.length, "chunk.vertices"),
            GLBuffer.create(gl, GLBufferType.ELEMENT_ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, chunk.indices, "chunk.indices"),
        ));
    }

    function getChunk(tile: Tile, chunks: Map<string, IntermediateChunk>): IntermediateChunk {
        const chunkQ = Math.floor((tile.identifier.q + (tile.identifier.r / 2)) / chunkSize);
        const chunkR = Math.floor(tile.identifier.r / chunkSize);
        const key = "" + chunkQ + "_" + chunkR;
        return chunks.has(key)
            ? chunks.get(key)!
            : {
                key: key,
                cq: chunkQ,
                cr: chunkR,
                vertices: [],
                indices: [],
                indexOffset: 0,
            } as IntermediateChunk;
    }

    function buildTileVertices(tile: Tile, chunkQ: number, chunkR: number): number[] {
        const vertices = Array(verticesPerTile * valuesPerVertex);

        let index = 0;

        function appendCenter() {
            appendTileCenterVertex(index, vertices, chunkQ, chunkR, tile);
            index += valuesPerVertex;
        }

        function appendCorner(cornerIndex: number) {
            appendTileCornerVertex(index, vertices, cornerIndex, chunkQ, chunkR, tile);
            index += valuesPerVertex;
        }

        // center
        appendCenter();
        // triangle a - corner a,b
        appendCorner(0);
        appendCorner(1);
        // triangle b - corner a,b
        appendCorner(1);
        appendCorner(2);
        // triangle c - corner a,b
        appendCorner(2);
        appendCorner(3);
        // triangle d - corner a,b
        appendCorner(3);
        appendCorner(4);
        // triangle e - corner a,b
        appendCorner(4);
        appendCorner(5);
        // triangle f - corner a,b
        appendCorner(5);
        appendCorner(0);

        return vertices;
    }

    function appendTileCenterVertex(index: number, outVertices: number[], chunkQ: number, chunkR: number, tile: Tile) {
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        const terrainId = getTerrainId(tile);
        const texCoords = getTextureCoordinates(-1, terrainId);
        // world position (x,y)
        outVertices[index + 0] = center[0];
        outVertices[index + 1] = center[1];
        // tile position (q,r)
        outVertices[index + 2] = tile.identifier.q;
        outVertices[index + 3] = tile.identifier.r;
        outVertices[index + 4] = chunkQ;
        outVertices[index + 5] = chunkR;
        // texture coordinates
        outVertices[index + 6] = texCoords[0];
        outVertices[index + 7] = texCoords[1];
        // terrain (visibility,type)
        outVertices[index + 8] = visibilityId(tile);
        outVertices[index + 9] = terrainId;
    }

    function appendTileCornerVertex(index: number, outVertices: number[], cornerIndex: number, chunkQ: number, chunkR: number, tile: Tile) {
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        const terrainId = getTerrainId(tile);
        const texCoords = getTextureCoordinates(cornerIndex, terrainId);
        // world position (x,y)
        outVertices[index + 0] = hexCornerPointX(cornerIndex, TilemapUtils.DEFAULT_HEX_LAYOUT.size, center);
        outVertices[index + 1] = hexCornerPointY(cornerIndex, TilemapUtils.DEFAULT_HEX_LAYOUT.size, center);
        // tile position (q,r)
        outVertices[index + 2] = tile.identifier.q;
        outVertices[index + 3] = tile.identifier.r;
        outVertices[index + 4] = chunkQ;
        outVertices[index + 5] = chunkR;
        // texture coordinates
        outVertices[index + 6] = texCoords[0];
        outVertices[index + 7] = texCoords[1];
        // terrain (visibility,type)
        outVertices[index + 8] = visibilityId(tile);
        outVertices[index + 9] = terrainId;
    }

    function hexCornerPointX(i: number, size: [number, number], offset: [number, number]): number {
        const angleDeg = 60 * i - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[0] * Math.cos(angleRad) + offset[0];
    }

    function hexCornerPointY(i: number, size: [number, number], offset: [number, number]): number {
        const angleDeg = 60 * i - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[1] * Math.sin(angleRad) + offset[1];
    }

    function getTextureCoordinates(index: number, tileSetOffset: number): [number, number] {
        const tileCount = 4;
        const shrink = 0.01;
        const x1 = (0 + tileSetOffset) / tileCount + shrink;
        const x2 = (0.5 + tileSetOffset) / tileCount;
        const x3 = (1 + tileSetOffset) / tileCount - shrink;
        const y1 = 0 + shrink;
        const y2 = 0.25;
        const y3 = 0.75;
        const y4 = 1 - shrink;
        switch (index) {
            case -1:
                return [x2, 0.5];
            case 0:
                return [x3, y2];
            case 1:
                return [x3, y3];
            case 2:
                return [x2, y4];
            case 3:
                return [x1, y3];
            case 4:
                return [x1, y2];
            case 5:
                return [x2, y1];
            default:
                return [0, 0];
        }
    }

    /**
     * @return the indices for each triangle of the hexagon
     */
    function indexData(offset: number): number[] {
        return [
            // triangle a
            0 + offset, 1 + offset, 2 + offset,
            // triangle b
            0 + offset, 3 + offset, 4 + offset,
            // triangle c
            0 + offset, 5 + offset, 6 + offset,
            // triangle d
            0 + offset, 7 + offset, 8 + offset,
            // triangle e
            0 + offset, 9 + offset, 10 + offset,
            // triangle f
            0 + offset, 11 + offset, 12 + offset,
        ];
    }

    function getTerrainId(tile: Tile) {
        switch (tile.terrainType) {
            case "WATER":
                return 0;
            case "LAND":
                return 3;
            case "MOUNTAIN":
                return 2;
            default:
                return 3;
        }
    }

    function visibilityId(tile: Tile) {
        switch (tile.visibility) {
            case "UNKNOWN":
                return 0;
            case "DISCOVERED":
                return 1;
            case "VISIBLE":
                return 2;
        }
    }

}