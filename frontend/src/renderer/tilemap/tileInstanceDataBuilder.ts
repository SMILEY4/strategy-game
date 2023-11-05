import {GLProgram} from "../../shared/webgl/glProgram";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../shared/webgl/mixedArrayBuffer";
import {Tile} from "../../models/tile";
import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLDisposable} from "../../shared/webgl/glDisposable";
import {GLAttributeType} from "../../shared/webgl/glTypes";
import {TilemapUtils} from "../../logic/game/tilemapUtils";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export namespace TileInstanceDataBuilder {

    const PATTERN_VERTEX = [
        // world position
        ...MixedArrayBufferType.VEC2,
    ];

    const VALUES_PER_INSTANCE = PATTERN_VERTEX.length;


    export function build(tiles: Tile[]): [number, ArrayBuffer] {
        const buffer = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VALUES_PER_INSTANCE * tiles.length, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(buffer);

        appendTiles(cursor, tiles);

        return [tiles.length, buffer.getRawBuffer()!];
    }


    export function appendTiles(cursor: MixedArrayBufferCursor, tiles: Tile[]) {
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.identifier.q, tile.identifier.r);
            cursor.append(center[0]);
            cursor.append(center[1]);
        }
    }

}