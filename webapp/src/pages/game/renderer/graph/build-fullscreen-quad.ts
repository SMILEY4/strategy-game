import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";

export function buildFullscreenQuad() {
    const buffer = new ArrayBuffer(6 * 2 * GlAttributeType.FLOAT.bytes);
    const view = new DataView(buffer);
    let viewCounter = 0;

    function pushFloat32(value: number) {
        view.setFloat32(viewCounter, value, true);
        viewCounter += GlAttributeType.FLOAT.bytes;
    }

    function pushFloat32Vec2(x: number, y: number) {
        pushFloat32(x);
        pushFloat32(y);
    }

    // triangle a
    pushFloat32Vec2(-1, -1);
    pushFloat32Vec2(+1, -1);
    pushFloat32Vec2(+1, +1);

    // triangle b
    pushFloat32Vec2(-1, -1);
    pushFloat32Vec2(-1, +1);
    pushFloat32Vec2(+1, +1);

    return {
        data: buffer,
        count: 6,
    };
}