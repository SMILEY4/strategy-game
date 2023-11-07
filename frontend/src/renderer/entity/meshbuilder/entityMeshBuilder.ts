import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {RenderEntity} from "./renderEntity";
import {Camera} from "../../../shared/webgl/camera";
import {TilemapUtils} from "../../../logic/game/tilemapUtils";

export namespace EntityMeshBuilder {

    const PATTERN_VERTEX = [
        // world position
        ...MixedArrayBufferType.VEC2,
    ];

    const VALUES_PER_INSTANCE = PATTERN_VERTEX.length;
    const VERTICES_PER_ENTITY = 6;


    export function build(camera: Camera, entities: RenderEntity[]): [number, ArrayBuffer] {
        const [buffer, cursor] = createMixedArray(entities.length);
        appendEntities(cursor, camera, entities);
        return [entities.length * VERTICES_PER_ENTITY, buffer.getRawBuffer()!];
    }


    function createMixedArray(entityCount: number): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(VALUES_PER_INSTANCE * VERTICES_PER_ENTITY * entityCount, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }


    function appendEntities(cursor: MixedArrayBufferCursor, camera: Camera, entities: RenderEntity[]) {
        for (let i = 0, n = entities.length; i < n; i++) {
            const entity = entities[i];
            appendEntity(cursor, camera, entity);
        }
    }

    function appendEntity(cursor: MixedArrayBufferCursor, camera: Camera, entity: RenderEntity) {

        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, entity.tile.q, entity.tile.r);
        const halfWidth = (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
        const halfHeight = (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);

        // triangle a, corner 1
        cursor.append(center[0] - halfWidth)
        cursor.append(center[1] - halfHeight)
        // triangle a, corner 2
        cursor.append(center[0] + halfWidth)
        cursor.append(center[1] - halfHeight)
        // triangle a, corner 3
        cursor.append(center[0] + halfWidth)
        cursor.append(center[1] + halfHeight)

        // triangle b, corner 1
        cursor.append(center[0] - halfWidth)
        cursor.append(center[1] - halfHeight)
        // triangle b, corner 2
        cursor.append(center[0] + halfWidth)
        cursor.append(center[1] + halfHeight)
        // triangle b, corner 3
        cursor.append(center[0] - halfWidth)
        cursor.append(center[1] + halfHeight)

    }


}