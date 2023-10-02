// noinspection PointlessArithmeticExpressionJS

import {Tile} from "../../../models/tile";
import {RenderChunk} from "./renderChunk";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../common/mixedArrayBuffer";
import {GLBuffer, GLBufferAttributeType, GLBufferType, GLBufferUsage} from "../common/glBuffer";
import {TilemapUtils} from "../../../core/tilemap/tilemapUtils";
import {AttributeInfo} from "../common/glProgram";
import {GLVertexArray} from "../common/glVertexArray";

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

    const PATTERN_INDEX = [
        MixedArrayBufferType.U_SHORT,
    ];
    const PATTERN_VERTEX = [
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.INT,
        MixedArrayBufferType.INT,
    ];

    const indicesPerTile = 18;
    const verticesPerTile = 13;
    const valuesPerVertex = 10;
    const chunkSize = 11;

    interface IntermediateChunk {
        key: string,
        cq: number,
        cr: number,
        amountTiles: number,
        indices: MixedArrayBuffer | null,
        cursorIndices: MixedArrayBufferCursor | null,
        indexOffset: number
        vertices: MixedArrayBuffer | null,
        cursorVertices: MixedArrayBufferCursor | null,
    }

    export function create(gl: WebGL2RenderingContext, tiles: Tile[], attributes: AttributeInfo[]): RenderChunk[] {
        const chunks = createChunks(tiles);
        createBuffers(chunks);
        populateBuffers(tiles, chunks);
        return Array.from(chunks.values()).map(chunk => {
            return new RenderChunk(
                chunk.cq,
                chunk.cr,
                GLVertexArray.create(
                    gl,
                    [
                        {
                            name: "in_worldPosition",
                            type: GLBufferAttributeType.FLOAT,
                            amountComponents: 2,
                            location: attributes.find(a => a.name === "in_worldPosition")!.location,
                        },
                        {
                            name: "in_tilePosition",
                            type: GLBufferAttributeType.FLOAT,
                            amountComponents: 4,
                            location: attributes.find(a => a.name === "in_tilePosition")!.location,
                        },
                        {
                            name: "in_textureCoordinates",
                            type: GLBufferAttributeType.FLOAT,
                            amountComponents: 2,
                            location: attributes.find(a => a.name === "in_textureCoordinates")!.location,
                        },
                        {
                            name: "in_terrain",
                            type: GLBufferAttributeType.INT,
                            amountComponents: 2,
                            location: attributes.find(a => a.name === "in_terrain")!.location,
                        },
                    ],
                    chunk.vertices?.getRawBuffer()!,
                    chunk.amountTiles * verticesPerTile * valuesPerVertex,
                ),
                GLBuffer.createRaw(
                    gl,
                    chunk.indices?.getRawBuffer()!,
                    chunk.amountTiles * indicesPerTile,
                    {
                        type: GLBufferType.ELEMENT_ARRAY_BUFFER,
                        usage: GLBufferUsage.STATIC_DRAW,
                        attributes: [],
                        debugName: "chunk.indices",
                    },
                ),
            );
        });
    }

    function createChunks(tiles: Tile[]): Map<string, IntermediateChunk> {
        const chunks = new Map<string, IntermediateChunk>();
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            const chunk = getChunkOrCreate(tile, chunks);
            chunk.amountTiles += 1;
            chunks.set(chunk.key, chunk);
        }
        return chunks;
    }

    function getChunkOrCreate(tile: Tile, chunks: Map<string, IntermediateChunk>): IntermediateChunk {
        const chunkQ = Math.floor((tile.identifier.q + (tile.identifier.r / 2)) / chunkSize);
        const chunkR = Math.floor(tile.identifier.r / chunkSize);
        const key = "" + chunkQ + "_" + chunkR;
        return chunks.has(key)
            ? chunks.get(key)!
            : {
                key: key,
                cq: chunkQ,
                cr: chunkR,
                amountTiles: 0,
                indices: null,
                cursorIndices: null,
                indexOffset: 0,
                vertices: null,
                cursorVertices: null,
            } as IntermediateChunk;
    }

    function createBuffers(chunks: Map<string, IntermediateChunk>) {
        chunks.forEach(chunk => {
            chunk.indices = new MixedArrayBuffer(
                MixedArrayBuffer.getTotalRequiredBytes(chunk.amountTiles * indicesPerTile, PATTERN_INDEX),
                PATTERN_INDEX,
            );
            chunk.vertices = new MixedArrayBuffer(
                MixedArrayBuffer.getTotalRequiredBytes(chunk.amountTiles * verticesPerTile * valuesPerVertex, PATTERN_VERTEX),
                PATTERN_VERTEX,
            );
            chunk.cursorIndices = new MixedArrayBufferCursor(chunk.indices);
            chunk.cursorVertices = new MixedArrayBufferCursor(chunk.vertices);
        });
    }


    function populateBuffers(tiles: Tile[], chunks: Map<string, IntermediateChunk>) {
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            const chunkQ = Math.floor((tile.identifier.q + (tile.identifier.r / 2)) / chunkSize);
            const chunkR = Math.floor(tile.identifier.r / chunkSize);
            const key = "" + chunkQ + "_" + chunkR;
            const chunk = chunks.get(key)!;
            appendTileIndices(chunk);
            appendTileVertices(tile, chunk);
        }
    }

    function appendTileIndices(chunk: IntermediateChunk) {
        const cursor = chunk.cursorIndices!;
        const offset = chunk.indexOffset;
        // triangle a
        cursor.append(0 + offset);
        cursor.append(1 + offset);
        cursor.append(2 + offset);
        // triangle b
        cursor.append(0 + offset);
        cursor.append(3 + offset);
        cursor.append(4 + offset);
        // triangle c
        cursor.append(0 + offset);
        cursor.append(5 + offset);
        cursor.append(6 + offset);
        // triangle d
        cursor.append(0 + offset);
        cursor.append(7 + offset);
        cursor.append(8 + offset);
        // triangle e
        cursor.append(0 + offset);
        cursor.append(9 + offset);
        cursor.append(10 + offset);
        // triangle f
        cursor.append(0 + offset);
        cursor.append(11 + offset);
        cursor.append(12 + offset);
        chunk.indexOffset += verticesPerTile;
    }

    function appendTileVertices(tile: Tile, chunk: IntermediateChunk) {
        appendTileCenterVertex(tile, chunk);
        // triangle a - corner a,b
        appendTileCornerVertex(tile, chunk, 0);
        appendTileCornerVertex(tile, chunk, 1);
        // triangle b - corner a,b
        appendTileCornerVertex(tile, chunk, 1);
        appendTileCornerVertex(tile, chunk, 2);
        // triangle c - corner a,b
        appendTileCornerVertex(tile, chunk, 2);
        appendTileCornerVertex(tile, chunk, 3);
        // triangle d - corner a,b
        appendTileCornerVertex(tile, chunk, 3);
        appendTileCornerVertex(tile, chunk, 4);
        // triangle e - corner a,b
        appendTileCornerVertex(tile, chunk, 4);
        appendTileCornerVertex(tile, chunk, 5);
        // triangle f - corner a,b
        appendTileCornerVertex(tile, chunk, 5);
        appendTileCornerVertex(tile, chunk, 0);
    }

    function appendTileCenterVertex(tile: Tile, chunk: IntermediateChunk) {
        const cursor = chunk.cursorVertices!;
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        const terrainId = getTerrainId(tile);
        const texCoords = getTextureCoordinates(-1, terrainId);
        // 2x world position (x,y)
        cursor.append(center);
        // 4x tile position (q,r, cq, cr)
        cursor.append(tile.identifier.q);
        cursor.append(tile.identifier.r);
        cursor.append(chunk.cq);
        cursor.append(chunk.cr);
        // 2x texture coordinates
        cursor.append(texCoords);
        // 2x terrain (visibility,type)
        cursor.append(visibilityId(tile));
        cursor.append(terrainId);
    }

    function appendTileCornerVertex(tile: Tile, chunk: IntermediateChunk, cornerIndex: number) {
        const cursor = chunk.cursorVertices!;
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        const terrainId = getTerrainId(tile);
        const texCoords = getTextureCoordinates(cornerIndex, terrainId);
        // 2x world position (x,y)
        cursor.append(hexCornerPointX(cornerIndex, TilemapUtils.DEFAULT_HEX_LAYOUT.size, center));
        cursor.append(hexCornerPointY(cornerIndex, TilemapUtils.DEFAULT_HEX_LAYOUT.size, center));
        // 4x tile position (q,r, cq, cr)
        cursor.append(tile.identifier.q);
        cursor.append(tile.identifier.r);
        cursor.append(chunk.cq);
        cursor.append(chunk.cr);
        // 2x texture coordinates
        cursor.append(texCoords);
        // 2x terrain (visibility,type)
        cursor.append(visibilityId(tile));
        cursor.append(terrainId);
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