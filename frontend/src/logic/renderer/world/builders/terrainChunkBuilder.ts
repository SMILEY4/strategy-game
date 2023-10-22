// noinspection PointlessArithmeticExpressionJS

import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/mixedArrayBuffer";
import {GLProgram} from "../../common/glProgram";
import {TerrainChunk} from "../data/terrainChunk";
import {Tile} from "../../../../models/tile";
import {TilemapUtils} from "../../../../_old_core/tilemap/tilemapUtils";
import {RenderBuilderUtils} from "./renderBuilderUtils";
import {GLVertexArray} from "../../common/glVertexArray";
import {GLAttributeType} from "../../common/glTypes";
import {GLVertexBuffer} from "../../common/glVertexBuffer";
import {GLIndexBuffer} from "../../common/glIndexBuffer";
import {TileContainer} from "../../../../models/tileContainer";
import GLProgramAttribute = GLProgram.GLProgramAttribute;
import toTerrainId = RenderBuilderUtils.toTerrainId;
import hexTextureCoordinates = RenderBuilderUtils.hexTextureCoordinates;
import hexCornerPointX = RenderBuilderUtils.hexCornerPointX;
import hexCornerPointY = RenderBuilderUtils.hexCornerPointY;
import toVisibilityId = RenderBuilderUtils.toVisibilityId;


/*
Vertices of hex-tiles are constructed as following (with corner index shown):
-1: center
 0. top-right
 1. bottom-right
 2. bottom
 3. bottom-left
 4. top-left
 5. top
*/

export namespace TerrainChunkBuilder {


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
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.INT,
        MixedArrayBufferType.INT,
    ];

    const INDICES_PER_TILE = 3 * 6; // "3 corners per triangle" * "6 triangles"
    const VERTICES_PER_TILE = 6 * 2 + 1; // "6 corners" * 2 + center
    const VALUES_PER_VERTEX = PATTERN_VERTEX.length;

    export function create(tileContainer: TileContainer, gl: WebGL2RenderingContext, shaderAttributes: GLProgramAttribute[]) {
        const chunks: TerrainChunk[] = [];
        for (let chunk of tileContainer.getChunks()) {
            chunks.push(createChunk(chunk, gl, shaderAttributes));
        }
        return chunks;
    }


    function createChunk(chunk: TileContainer.Chunk, gl: WebGL2RenderingContext, shaderAttributes: GLProgramAttribute[]): TerrainChunk {

        const tiles = chunk.getTiles();
        const amountTiles = tiles.length;

        const indices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(amountTiles * INDICES_PER_TILE, PATTERN_INDEX),
            PATTERN_INDEX,
        );
        const vertices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(amountTiles * VERTICES_PER_TILE * VALUES_PER_VERTEX, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursorIndices = new MixedArrayBufferCursor(indices);
        const cursorVertices = new MixedArrayBufferCursor(vertices);

        let indexOffset = 0;
        for (let i = 0, n = amountTiles; i < n; i++) {
            const tile = tiles[i];
            indexOffset = appendTileIndices(indexOffset, cursorIndices);
            appendTileVertices(chunk.getChunkQ(), chunk.getChunkR(), tile, cursorVertices);
        }

        const vertexBuffer = GLVertexBuffer.create(gl, vertices.getRawBuffer()!);
        const indexBuffer = GLIndexBuffer.create(
            gl,
            indices.getRawBuffer()!,
            amountTiles * INDICES_PER_TILE,
        );

        return new TerrainChunk(
            GLVertexArray.create(
                gl,
                [
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_worldPosition")!.location,
                        type: GLAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_tilePosition")!.location,
                        type: GLAttributeType.FLOAT,
                        amountComponents: 4,
                    },
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_cornerData")!.location,
                        type: GLAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_textureCoordinates")!.location,
                        type: GLAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        buffer: vertexBuffer,
                        location: shaderAttributes.find(a => a.name === "in_terrain")!.location,
                        type: GLAttributeType.INT,
                        amountComponents: 2,
                    },
                ],
                indexBuffer,
            ),
            indexBuffer.getSize(),
            [vertexBuffer, indexBuffer],
        );
    }

    function appendTileIndices(indexOffset: number, cursor: MixedArrayBufferCursor): number {
        // triangle a
        cursor.append(0 + indexOffset);
        cursor.append(1 + indexOffset);
        cursor.append(2 + indexOffset);
        // triangle b
        cursor.append(0 + indexOffset);
        cursor.append(3 + indexOffset);
        cursor.append(4 + indexOffset);
        // triangle c
        cursor.append(0 + indexOffset);
        cursor.append(5 + indexOffset);
        cursor.append(6 + indexOffset);
        // triangle d
        cursor.append(0 + indexOffset);
        cursor.append(7 + indexOffset);
        cursor.append(8 + indexOffset);
        // triangle e
        cursor.append(0 + indexOffset);
        cursor.append(9 + indexOffset);
        cursor.append(10 + indexOffset);
        // triangle f
        cursor.append(0 + indexOffset);
        cursor.append(11 + indexOffset);
        cursor.append(12 + indexOffset);
        return indexOffset + VERTICES_PER_TILE;
    }

    function appendTileVertices(cq: number, cr: number, tile: Tile, cursor: MixedArrayBufferCursor) {
        appendTileCenterVertex(cq, cr, tile, cursor);
        // triangle a - corner a,b
        appendTileCornerVertex(cq, cr, tile, 0, cursor);
        appendTileCornerVertex(cq, cr, tile, 1, cursor);
        // triangle b - corner a,b
        appendTileCornerVertex(cq, cr, tile, 1, cursor);
        appendTileCornerVertex(cq, cr, tile, 2, cursor);
        // triangle c - corner a,b
        appendTileCornerVertex(cq, cr, tile, 2, cursor);
        appendTileCornerVertex(cq, cr, tile, 3, cursor);
        // triangle d - corner a,b
        appendTileCornerVertex(cq, cr, tile, 3, cursor);
        appendTileCornerVertex(cq, cr, tile, 4, cursor);
        // triangle e - corner a,b
        appendTileCornerVertex(cq, cr, tile, 4, cursor);
        appendTileCornerVertex(cq, cr, tile, 5, cursor);
        // triangle f - corner a,b
        appendTileCornerVertex(cq, cr, tile, 5, cursor);
        appendTileCornerVertex(cq, cr, tile, 0, cursor);
    }

    function appendTileCenterVertex(cq: number, cr: number, tile: Tile, cursor: MixedArrayBufferCursor) {
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        const terrainId = toTerrainId(tile);
        const texCoords = hexTextureCoordinates(-1, terrainId);
        // 2x world position (x,y)
        cursor.append(center);
        // 4x tile position (q,r, cq, cr)
        cursor.append(tile.identifier.q);
        cursor.append(tile.identifier.r);
        cursor.append(cq);
        cursor.append(cr);
        // 3x corner data
        cursor.append(1);
        cursor.append(0);
        cursor.append(0);
        // 2x texture coordinates
        cursor.append(texCoords);
        // 2x terrain (visibility,type)
        cursor.append(toVisibilityId(tile));
        cursor.append(terrainId);
    }

    function appendTileCornerVertex(cq: number, cr: number, tile: Tile, cornerIndex: number, cursor: MixedArrayBufferCursor) {
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
        const terrainId = toTerrainId(tile);
        const texCoords = hexTextureCoordinates(cornerIndex, terrainId);
        // 2x world position (x,y)
        cursor.append(hexCornerPointX(cornerIndex, TilemapUtils.DEFAULT_HEX_LAYOUT.size, center));
        cursor.append(hexCornerPointY(cornerIndex, TilemapUtils.DEFAULT_HEX_LAYOUT.size, center));
        // 4x tile position (q,r, cq, cr)
        cursor.append(tile.identifier.q);
        cursor.append(tile.identifier.r);
        cursor.append(cq);
        cursor.append(cr);
        // 3x corner data
        if (cornerIndex % 2 === 0) {
            cursor.append(0);
            cursor.append(1);
            cursor.append(0);
        } else {
            cursor.append(0);
            cursor.append(0);
            cursor.append(1);
        }
        // 2x texture coordinates
        cursor.append(texCoords);
        // 2x terrain (visibility,type)
        cursor.append(toVisibilityId(tile));
        cursor.append(terrainId);
    }

}
