#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
flat in vec2 v_chunkPosition;

out vec4 outColor;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {

    // tile position
//    float r = hash(v_tilePosition + vec2(0.0, 0.0));
//    float g = hash(v_tilePosition + vec2(1.0, 2.0));
//    float b = hash(v_tilePosition + vec2(3.0, 4.0));

    // chunk position
    float r = hash(v_chunkPosition + vec2(0.0, 0.0));
    float g = hash(v_chunkPosition + vec2(1.0, 2.0));
    float b = hash(v_chunkPosition + vec2(3.0, 4.0));
    if(v_tilePosition.x == v_chunkPosition.x && v_tilePosition.y == v_chunkPosition.y) {
        r = 1.0;
        g = 1.0;
        b = 1.0;
    }

    outColor = vec4(r, g, b, 1.0);

}